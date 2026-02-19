from core.parser import parse_traceback

# Paste a REAL error from your terminal here
test_error = """
Traceback (most recent call last):
  File "app.py", line 23, in main
    user_id = request.user.id
AttributeError: 'NoneType' object has no attribute 'id'
"""

fingerprint = parse_traceback(test_error)
if fingerprint:
    print("Parsed successfully")
    print(f"Type: {fingerprint.error_type}")
    print(f"Message: {fingerprint.error_message}")
    print(f"Embed text: {fingerprint.to_embed_text()}")
else:
    print("✗ Failed to parse")