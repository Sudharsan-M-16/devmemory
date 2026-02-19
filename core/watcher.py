import subprocess
from core.parser import parse_traceback
from core.memory import DevMemory
from core.llm import generate_fix_suggestion
from rich.console import Console
from rich.panel import Panel

console = Console()

def run_and_watch(command: str):
    """
    Runs a shell command.
    If it crashes, DevMemory automatically analyzes the error.
    """

    console.print(f"[cyan]Running:[/cyan] {command}\n")

    process = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True
    )

    # Print program stdout normally
    if process.stdout:
        print(process.stdout)

    # If no error → exit
    if process.returncode == 0:
        console.print("[green]Program finished without errors.[/green]")
        return

    error_text = process.stderr
    console.print("[red]Program crashed.[/red]\n")
    print(error_text)

    # Parse error
    fingerprint = parse_traceback(error_text)
    if not fingerprint:
        console.print("[yellow]Could not parse error.[/yellow]")
        return

    memory = DevMemory()

    console.print(
        f"\n[bold]Detected:[/bold] {fingerprint.error_type}: {fingerprint.error_message}"
    )

    matches = memory.search(fingerprint)

    if matches:
        console.print(f"\n[bold]Found {len(matches)} similar past error(s):[/bold]")
        for m in matches:
            console.print(f"- {m['similarity']} → {m['fix']}")

    console.print("\n[cyan]Generating AI suggestion...[/cyan]")
    suggestion = generate_fix_suggestion(fingerprint, matches)

    console.print(
        Panel(suggestion, title="DevMemory", border_style="green")
    )

    fix = input("\nHow did you fix it? (enter to skip) ").strip()
    if fix:
        memory.store(fingerprint, fix)
        console.print("[green]Saved to memory.[/green]")

