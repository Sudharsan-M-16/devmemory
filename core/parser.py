import re
from dataclasses import dataclass
from typing import Optional

@dataclass
class ErrorFingerprint:
    error_type: str        # "TypeError"
    error_message: str     # "cannot read property 'id' of undefined"
    top_frames: list       # [{"file": "server.py", "line": 47, "code": "user_id = ..."}]
    raw_trace: str         # full original traceback
    
    def to_embed_text(self) -> str:
        """What we actually embed - clean and semantic"""
        frames = " | ".join(
            f"{f['file']}:{f['line']}: {f['code']}"
            for f in self.top_frames[:2]  # Only top 2 frames
        )
        # Keep this close to the “semantic fingerprint” in the guide:
        # "<ErrorType>: <message>\nfile.py:47: code ..."
        return f"{self.error_type}: {self.error_message}\n{frames}"


def parse_traceback(text: str) -> Optional[ErrorFingerprint]:
    """Extract semantic fingerprint from a Python traceback"""
    
    # Find the error type and message (last line of traceback)
    error_pattern = r'^(\w+(?:\.\w+)*Error|\w+Exception|\w+Warning):\s*(.+)$'
    lines = text.strip().split('\n')
    
    error_type = None
    error_message = None
    
    for line in reversed(lines):
        match = re.match(error_pattern, line.strip())
        if match:
            error_type = match.group(1)
            error_message = match.group(2)
            break
    
    if not error_type:
        return None
    
    # Extract stack frames (lines with "File ... line ...")
    frame_pattern = r'File "([^"]+)", line (\d+), in (\w+)'
    frames = []
    
    for i, line in enumerate(lines):
        match = re.search(frame_pattern, line)
        if match:
            filepath = match.group(1)
            lineno = int(match.group(2))
            
            # Skip library internals (site-packages, Python stdlib)
            if 'site-packages' in filepath or '/usr/lib/python' in filepath:
                continue
                
            # Get the code line (usually the next line)
            code_line = lines[i+1].strip() if i+1 < len(lines) else ""
            
            # Only keep filename, not full path
            filename = filepath.split('/')[-1]
            
            frames.append({
                "file": filename,
                "line": lineno,
                "code": code_line
            })
    
    return ErrorFingerprint(
        error_type=error_type,
        error_message=error_message,
        top_frames=frames,
        raw_trace=text
    )