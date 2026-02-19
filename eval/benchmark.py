import json
from core.parser import parse_traceback
from core.memory import DevMemory

def run_benchmark(test_file="eval/test_errors.json"):
    with open(test_file) as f:
        test_cases = json.load(f)

    results = {
        "total": len(test_cases),
        "hits_at_1": 0,
        "hits_at_3": 0,
        "no_match": 0,
        "failed_to_parse": 0,
    }

    for i, case in enumerate(test_cases):
        memory = DevMemory()

        # Store all OTHER cases
        for j, other in enumerate(test_cases):
            if i == j:
                continue
            fp_other = parse_traceback(other["error_trace"])
            if fp_other:
                memory.store(fp_other, other["stored_fix"])

        # Now test current case
        fingerprint = parse_traceback(case["error_trace"])
        if not fingerprint:
            results["failed_to_parse"] += 1
            continue

        matches = memory.search(fingerprint, n_results=3)

        if not matches:
            results["no_match"] += 1
            continue

        top_1_fix = matches[0]["fix"].lower()
        top_3_fixes = " ".join(m["fix"].lower() for m in matches)
        keywords = [k.lower() for k in case["fix_keywords"]]

        if any(k in top_1_fix for k in keywords):
            results["hits_at_1"] += 1
            results["hits_at_3"] += 1
        elif any(k in top_3_fixes for k in keywords):
            results["hits_at_3"] += 1

    total_valid = results["total"] - results["failed_to_parse"]

    print("\n=== DevMemory Benchmark (Leave-One-Out) ===")
    print(f"Test cases: {results['total']}")
    print(
        f"Precision@1: {results['hits_at_1']}/{total_valid} = "
        f"{results['hits_at_1']/total_valid:.1%}"
    )
    print(
        f"Precision@3: {results['hits_at_3']}/{total_valid} = "
        f"{results['hits_at_3']/total_valid:.1%}"
    )
    print(f"No match found: {results['no_match']}")

    return results

if __name__ == "__main__":
    run_benchmark()
