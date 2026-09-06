import http.server
import socketserver
import json
import os
import sys
import time
from datetime import datetime

PORT = int(os.environ.get('PORT', 8000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
RESPONSES_JSON = os.path.join(DIRECTORY, 'user_responses.json')
RESPONSES_JSONL = os.path.join(DIRECTORY, 'user_responses.jsonl')

class PixelSpurHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _set_cors(self, content_type='application/json'):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        self.send_header('Content-Type', content_type)

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors()
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/feedback' or self.path == '/api/responses':
            self.send_response(200)
            self._set_cors('application/json')
            self.end_headers()
            try:
                if os.path.exists(RESPONSES_JSON):
                    with open(RESPONSES_JSON, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                else:
                    data = []
                response = {
                    'status': 'success',
                    'count': len(data),
                    'responses': data
                }
                self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
            except Exception as e:
                err_resp = {'status': 'error', 'message': str(e)}
                self.wfile.write(json.dumps(err_resp).encode('utf-8'))
            return

        super().do_GET()

    def do_POST(self):
        if self.path == '/api/feedback' or self.path == '/api/responses':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(post_body) if post_body else {}

                timestamp_iso = datetime.utcnow().isoformat() + 'Z'
                record_id = 'resp_' + datetime.utcnow().strftime('%Y%m%d_%H%M%S') + '_' + str(int(time.time() * 1000) % 10000).zfill(4)

                category = payload.get('category', 'general_issue')
                character = payload.get('character', '')
                action = payload.get('action', '')
                frames = payload.get('frames', 10)
                layout = payload.get('layout', '')
                style = payload.get('style', '')
                engine = payload.get('engine', '')
                prompt_used = payload.get('prompt_used', '')
                user_issue = payload.get('user_issue', '')
                expected_behavior = payload.get('expected_behavior', '')
                rating = payload.get('rating', 3)

                training_pair = {
                    'system': 'You are an expert 2D game asset and diffusion animation prompt engineering AI.',
                    'input': f'Generate a {frames}-frame {action} sprite sheet for {character} in {style} on {layout}',
                    'negative_critique': f'Avoid reported issue: {user_issue}',
                    'ideal_prompt': expected_behavior if expected_behavior else prompt_used,
                    'engine_target': engine
                }

                new_record = {
                    'id': record_id,
                    'timestamp': timestamp_iso,
                    'category': category,
                    'character': character,
                    'action': action,
                    'frames': frames,
                    'layout': layout,
                    'style': style,
                    'engine': engine,
                    'prompt_used': prompt_used,
                    'user_issue': user_issue,
                    'expected_behavior': expected_behavior,
                    'rating': rating,
                    'training_pair': training_pair
                }

                all_data = []
                if os.path.exists(RESPONSES_JSON):
                    try:
                        with open(RESPONSES_JSON, 'r', encoding='utf-8') as f:
                            all_data = json.load(f)
                    except Exception:
                        all_data = []

                all_data.append(new_record)

                with open(RESPONSES_JSON, 'w', encoding='utf-8') as f:
                    json.dump(all_data, f, indent=2, ensure_ascii=False)

                with open(RESPONSES_JSONL, 'a', encoding='utf-8') as f:
                    f.write(json.dumps(new_record, ensure_ascii=False) + '\n')

                self.send_response(200)
                self._set_cors('application/json')
                self.end_headers()
                res = {
                    'status': 'success',
                    'message': 'Feedback and AI training record successfully saved.',
                    'id': record_id,
                    'count': len(all_data),
                    'record': new_record
                }
                self.wfile.write(json.dumps(res, indent=2).encode('utf-8'))
                print(f'[AI Training Lab] Recorded new response: {record_id} ({category})')
            except Exception as e:
                self.send_response(500)
                self._set_cors('application/json')
                self.end_headers()
                err_resp = {'status': 'error', 'message': str(e)}
                self.wfile.write(json.dumps(err_resp).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), PixelSpurHandler) as httpd:
        print(f'Serving HTTP and AI Feedback API on port {PORT}')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
