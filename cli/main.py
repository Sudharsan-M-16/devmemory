import sys
from rich.console import Console
from rich.panel import Panel
from core.watcher import run_and_watch

from core.parser import parse_traceback
from core.memory import DevMemory
from core.llm import generate_fix_suggestion

console = Console()
memory = DevMemory()

def query(error_text):
    fingerprint = parse_traceback(error_text)

    if not fingerprint:
        console.print("[red]Could not parse error[/red]")
        return

    console.print(f"\n[yellow]{fingerprint.error_type}[/yellow]: {fingerprint.error_message}")
    console.print(f"[dim]Searching {memory.count()} stored errors...[/dim]")

    matches = memory.search(fingerprint)

    if matches:
        console.print(f"\n[green]Found {len(matches)} similar error(s):[/green]")
        for m in matches:
            console.print(f"- {m['similarity']} → {m['fix']}")
    else:
        console.print("\n[dim]No similar past errors found[/dim]")

    console.print("\n[dim]Generating suggestion...[/dim]")
    suggestion = generate_fix_suggestion(fingerprint, matches)

    console.print(
        Panel(suggestion, title="DevMemory", border_style="green")
    )

    fix = console.input("\nHow did you fix it? (enter to skip) ")
    if fix.strip():
        memory.store(fingerprint, fix.strip())
        console.print("[green]Stored in memory[/green]")

def learn(error_text, fix):
    fingerprint = parse_traceback(error_text)
    if fingerprint:
        memory.store(fingerprint, fix)
        console.print("[green]Stored in memory[/green]")
    else:
        console.print("[red]Could not parse error[/red]")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        console.print("Usage:")
        console.print(" python -m cli.main query '<error>'")
        console.print(" python -m cli.main learn '<error>' '<fix>'")
        sys.exit(1)

    if sys.argv[1] == "query":
        query(" ".join(sys.argv[2:]))
    elif sys.argv[1] == "watch":
        cmd = " ".join(sys.argv[2:])
        run_and_watch(cmd)
    elif sys.argv[1] == "learn":
        learn(sys.argv[2], sys.argv[3])
