from flask import jsonify

def api_response(success:bool, message: str, data: None, status_code: int=200):
	if data is None:
		data={}

	response_payload={
		"success":success,
		"message":message,
		"data":data
	}

	return jsonify(response_payload), status_code