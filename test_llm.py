from core.parser import parse_traceback
from core.memory import DevMemory
from core.llm import generate_fix_suggestion

memory = DevMemory()

error = """
Traceback (most recent call last):
  File "app.py", line 23, in main
    user_id = request.user.id
AttributeError: 'NoneType' object has no attribute 'id'
"""

fp = parse_traceback(error)
matches = memory.search(fp)

suggestion = generate_fix_suggestion(fp, matches)

print("=== AI Suggestion ===")
print(suggestion)

