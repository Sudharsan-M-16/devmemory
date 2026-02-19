import subprocess

def generate_fix_suggestion(fingerprint, matches):

    if matches:
        history = "\n".join(
            f"- Similarity {m['similarity']}: {m['fix']}"
            for m in matches
        )

        prompt = f"""
You are a personal debugging assistant.

CURRENT ERROR:
{fingerprint.to_embed_text()}

PAST SIMILAR ERRORS I FIXED:
{history}

Based on my past fixes, suggest the most likely solution.
Be concise and specific.
"""
    else:
        prompt = f"""
You are a debugging assistant.

CURRENT ERROR:
{fingerprint.to_embed_text()}

No similar past errors found.
Suggest a general fix.
"""

    result = subprocess.run(
        ["ollama", "run", "mistral"],
        input=prompt,
        text=True,
        capture_output=True
    )

    return result.stdout.strip()
