from core.parser import parse_traceback
from core.memory import DevMemory

memory = DevMemory()

# Test error 1
error1 = """
Traceback...
AttributeError: 'NoneType' object has no attribute 'id'
"""

fp1 = parse_traceback(error1)
memory.store(fp1, "Added null check before accessing .id")

print(f"✓ Stored. Memory now has {memory.count()} errors")

# Test error 2 (similar)
error2 = """
Traceback...
AttributeError: 'NoneType' object has no attribute 'name'
"""

fp2 = parse_traceback(error2)
matches = memory.search(fp2)

print(f"\n✓ Found {len(matches)} matches:")
for m in matches:
    print(f"  - Similarity: {m['similarity']} | Fix: {m['fix']}")