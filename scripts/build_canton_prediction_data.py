#!/usr/bin/env python3
from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import json
import math
from pathlib import Path
import statistics
import sys
import unicodedata
import re
from typing import Any, Iterable, Mapping


WEB_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_VISUAL_PROJECT_ROOT = Path("/scratch/izar/youyang/CS503-Visual-Intelligence-Project")
DEFAULT_CONFIG_PATH = DEFAULT_VISUAL_PROJECT_ROOT / "config/experiments/plonk_local_fm_r2_image_only.yaml"
DEFAULT_CHECKPOINT_PATH = Path(
    "/scratch/izar/youyang/visual_geolocation_cfm_poc/runs/"
    "plonk_local_fm_r2_image_only_seed42/checkpoint_best.pt"
)
DEFAULT_OUTPUT_PATH = WEB_ROOT / "static/data/canton-predictions.json"
DEFAULT_EVAL_ROOT = Path("/tmp/canton-prediction-map-eval")


@dataclass(frozen=True)
class CantonSpec:
    id: str
    name: str
    region_aliases: tuple[str, ...]
    boundary_aliases: tuple[str, ...]


CANTONS: tuple[CantonSpec, ...] = (
    CantonSpec("ZH", "Zurich", ("Zurich", "Zuerich", "Z\u00fcrich"), ("Zurich", "Zuerich", "Z\u00fcrich")),
    CantonSpec("BE", "Bern", ("Bern", "Berne"), ("Bern", "Berne")),
    CantonSpec("LU", "Lucerne", ("Lucerne", "Luzern"), ("Lucerne", "Luzern")),
    CantonSpec("UR", "Uri", ("Uri",), ("Uri",)),
    CantonSpec("SZ", "Schwyz", ("Schwyz",), ("Schwyz",)),
    CantonSpec("OW", "Obwalden", ("Obwalden",), ("Obwalden",)),
    CantonSpec("NW", "Nidwalden", ("Nidwalden",), ("Nidwalden",)),
    CantonSpec("GL", "Glarus", ("Glarus",), ("Glarus",)),
    CantonSpec("ZG", "Zug", ("Zug",), ("Zug",)),
    CantonSpec("FR", "Fribourg", ("Fribourg", "Freiburg"), ("Fribourg", "Freiburg")),
    CantonSpec("SO", "Solothurn", ("Solothurn",), ("Solothurn",)),
    CantonSpec("BS", "Basel-City", ("Basel-City", "Basel City", "Basel-Stadt"), ("Basel-City", "Basel City", "Basel-Stadt")),
    CantonSpec(
        "BL",
        "Basel-Landschaft",
        ("Basel-Landschaft", "Basel Landschaft", "Basel-Country"),
        ("Basel-Landschaft", "Basel Landschaft", "Basel-Country"),
    ),
    CantonSpec("SH", "Schaffhausen", ("Schaffhausen",), ("Schaffhausen",)),
    CantonSpec(
        "AR",
        "Appenzell Ausserrhoden",
        ("Appenzell Ausserrhoden", "Appenzell Outer Rhodes"),
        ("Appenzell Ausserrhoden", "Appenzell Outer Rhodes"),
    ),
    CantonSpec(
        "AI",
        "Appenzell Innerrhoden",
        ("Appenzell Innerrhoden", "Appenzell Inner Rhodes"),
        ("Appenzell Innerrhoden", "Appenzell Inner Rhodes"),
    ),
    CantonSpec("SG", "Saint Gallen", ("Saint Gallen", "St. Gallen", "Sankt Gallen"), ("Saint Gallen", "St. Gallen", "Sankt Gallen")),
    CantonSpec("GR", "Grisons", ("Grisons", "Graubuenden", "Graub\u00fcnden"), ("Grisons", "Graubuenden", "Graub\u00fcnden")),
    CantonSpec("AG", "Aargau", ("Aargau",), ("Aargau",)),
    CantonSpec("TG", "Thurgau", ("Thurgau",), ("Thurgau",)),
    CantonSpec("TI", "Ticino", ("Ticino", "Tessin"), ("Ticino", "Tessin")),
    CantonSpec("VD", "Vaud", ("Vaud",), ("Vaud",)),
    CantonSpec("VS", "Valais", ("Valais", "Wallis"), ("Valais", "Wallis")),
    CantonSpec("NE", "Neuchatel", ("Neuchatel", "Neuch\u00e2tel"), ("Neuchatel", "Neuch\u00e2tel")),
    CantonSpec("GE", "Geneva", ("Geneva", "Geneve", "Gen\u00e8ve"), ("Geneva", "Geneve", "Gen\u00e8ve")),
    CantonSpec("JU", "Jura", ("Jura",), ("Jura",)),
)


REQUIRED_ROW_FIELDS = {
    "ground_truth_lat",
    "ground_truth_lon",
    "mode_lat",
    "mode_lon",
}


def normalize_label(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(character for character in text if not unicodedata.combining(character))
    text = text.lower().replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _alias_lookup() -> dict[str, CantonSpec]:
    lookup: dict[str, CantonSpec] = {}
    for canton in CANTONS:
        for alias in (canton.id, canton.name, *canton.region_aliases, *canton.boundary_aliases):
            lookup[normalize_label(alias)] = canton
    return lookup


ALIAS_TO_CANTON = _alias_lookup()


def resolve_canton(value: Any) -> CantonSpec | None:
    return ALIAS_TO_CANTON.get(normalize_label(value))


def load_prediction_rows(path: str | Path) -> list[dict[str, Any]]:
    prediction_path = Path(path)
    rows: list[dict[str, Any]] = []
    with prediction_path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            missing_fields = sorted(field for field in REQUIRED_ROW_FIELDS if field not in row)
            if missing_fields:
                raise ValueError(f"{prediction_path}:{line_number} missing required fields: {missing_fields}")
            rows.append(row)
    if not rows:
        raise ValueError(f"No prediction rows found in {prediction_path}")
    return rows


def _coerce_float(row: Mapping[str, Any], key: str) -> float:
    return float(row[key])


def _haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_km = 6371.0088
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    a = math.sin(delta_lat / 2.0) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2.0) ** 2
    return radius_km * 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(1.0 - a, 0.0)))


def row_distance_km(row: Mapping[str, Any]) -> float:
    if row.get("mode_distance_km") not in (None, ""):
        return float(row["mode_distance_km"])
    return _haversine_distance_km(
        _coerce_float(row, "ground_truth_lat"),
        _coerce_float(row, "ground_truth_lon"),
        _coerce_float(row, "mode_lat"),
        _coerce_float(row, "mode_lon"),
    )


def _mean(values: list[float]) -> float | None:
    return float(statistics.fmean(values)) if values else None


def _median(values: list[float]) -> float | None:
    return float(statistics.median(values)) if values else None


def _accuracy_at(values: list[float], threshold_km: float) -> float | None:
    if not values:
        return None
    return float(sum(value <= threshold_km for value in values) / len(values))


def _round_or_none(value: float | None, digits: int = 6) -> float | None:
    return round(float(value), digits) if value is not None else None


def _compact_point(row: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "sample_id": str(row.get("sample_id", "")),
        "gt_lat": round(_coerce_float(row, "ground_truth_lat"), 6),
        "gt_lon": round(_coerce_float(row, "ground_truth_lon"), 6),
        "mode_lat": round(_coerce_float(row, "mode_lat"), 6),
        "mode_lon": round(_coerce_float(row, "mode_lon"), 6),
        "distance_km": round(row_distance_km(row), 3),
        "sub_region": str(row.get("sub_region", "")),
        "city": str(row.get("city", "")),
    }


def build_canton_payload(
    rows: Iterable[Mapping[str, Any]],
    *,
    checkpoint_path: str | Path,
    split: str,
    summary: Mapping[str, Any] | None = None,
    generated_at: str | None = None,
) -> dict[str, Any]:
    grouped: dict[str, list[Mapping[str, Any]]] = {canton.id: [] for canton in CANTONS}
    unmatched_regions: dict[str, int] = {}

    for row in rows:
        region_label = row.get("region") or "Unknown Region"
        canton = resolve_canton(region_label)
        if canton is None:
            unmatched_regions[str(region_label)] = unmatched_regions.get(str(region_label), 0) + 1
            continue
        grouped[canton.id].append(row)

    regions: list[dict[str, Any]] = []
    all_distances: list[float] = []
    for canton in CANTONS:
        canton_rows = grouped[canton.id]
        distances = [row_distance_km(row) for row in canton_rows]
        all_distances.extend(distances)
        regions.append(
            {
                "id": canton.id,
                "name": canton.name,
                "aliases": list(canton.region_aliases),
                "boundary_aliases": list(canton.boundary_aliases),
                "count": len(canton_rows),
                "mean_mode_distance_km": _round_or_none(_mean(distances), 3),
                "median_mode_distance_km": _round_or_none(_median(distances), 3),
                "accuracy_at_25km": _round_or_none(_accuracy_at(distances, 25.0), 4),
                "accuracy_at_100km": _round_or_none(_accuracy_at(distances, 100.0), 4),
                "points": [_compact_point(row) for row in canton_rows],
            }
        )

    checkpoint_epoch = None
    if summary:
        checkpoint_epoch = summary.get("checkpoint", {}).get("epoch")
    checkpoint_text = str(Path(checkpoint_path).expanduser().resolve())
    return {
        "meta": {
            "generated_at": generated_at or datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            "checkpoint_path": checkpoint_text,
            "checkpoint_epoch": checkpoint_epoch,
            "split": split,
            "total_count": len(all_distances),
            "mean_mode_distance_km": _round_or_none(_mean(all_distances), 3),
            "median_mode_distance_km": _round_or_none(_median(all_distances), 3),
            "accuracy_at_25km": _round_or_none(_accuracy_at(all_distances, 25.0), 4),
            "accuracy_at_100km": _round_or_none(_accuracy_at(all_distances, 100.0), 4),
            "unmatched_regions": unmatched_regions,
        },
        "regions": regions,
    }


def _load_json(path: str | Path | None) -> dict[str, Any] | None:
    if not path:
        return None
    with Path(path).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _insert_visual_project_src(visual_project_root: str | Path) -> None:
    src_path = str((Path(visual_project_root).expanduser().resolve() / "src"))
    if src_path not in sys.path:
        sys.path.insert(0, src_path)


def evaluate_checkpoint(args: argparse.Namespace) -> tuple[Path, dict[str, Any]]:
    _insert_visual_project_src(args.visual_project_root)

    from visual_geolocation.evaluate import run_evaluation
    from visual_geolocation.experiment_config import load_experiment_config
    from visual_geolocation.inference import pick_device

    checkpoint_path = Path(args.checkpoint).expanduser().resolve()
    config = load_experiment_config(args.config)
    config.evaluation.splits = [args.split]
    config.paths.runs_dir = str((Path(args.eval_root).expanduser().resolve() / "runs"))
    config.train.num_workers = int(args.num_workers)
    if args.batch_size is not None:
        config.train.eval_batch_size = int(args.batch_size)
    if args.num_samples is not None:
        config.inference.num_samples = int(args.num_samples)
    if args.num_steps is not None:
        config.inference.num_steps = int(args.num_steps)
    if args.cfg_rate is not None:
        config.inference.cfg_rate = float(args.cfg_rate)

    result = run_evaluation(config, checkpoint_path, device=pick_device(args.device))
    summary = result["summary"]
    actual_checkpoint = Path(summary["checkpoint"]["path"]).expanduser().resolve()
    if actual_checkpoint != checkpoint_path:
        raise RuntimeError(f"Evaluation summary checkpoint mismatch: {actual_checkpoint} != {checkpoint_path}")

    per_example_paths = [Path(path) for path in result.get("per_example_paths", [])]
    for per_example_path in per_example_paths:
        if per_example_path.name == f"{args.split}_per_example.jsonl":
            return per_example_path, summary
    if per_example_paths:
        return per_example_paths[0], summary
    raise RuntimeError("Evaluation completed without a per-example prediction file.")


def write_payload(payload: Mapping[str, Any], path: str | Path) -> Path:
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=True)
        handle.write("\n")
    return output_path


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build deployable canton-level prediction data for the static webpage.")
    parser.add_argument("--visual-project-root", type=str, default=str(DEFAULT_VISUAL_PROJECT_ROOT))
    parser.add_argument("--config", type=str, default=str(DEFAULT_CONFIG_PATH))
    parser.add_argument("--checkpoint", type=str, default=str(DEFAULT_CHECKPOINT_PATH))
    parser.add_argument("--split", type=str, default="test")
    parser.add_argument("--output", type=str, default=str(DEFAULT_OUTPUT_PATH))
    parser.add_argument("--eval-root", type=str, default=str(DEFAULT_EVAL_ROOT))
    parser.add_argument("--per-example", type=str, default=None, help="Build from an existing per-example JSONL instead of running evaluation.")
    parser.add_argument("--summary", type=str, default=None, help="Optional summary JSON when using --per-example.")
    parser.add_argument("--device", type=str, default=None)
    parser.add_argument("--num-workers", type=int, default=0)
    parser.add_argument("--batch-size", type=int, default=None)
    parser.add_argument("--num-samples", type=int, default=None)
    parser.add_argument("--num-steps", type=int, default=None)
    parser.add_argument("--cfg-rate", type=float, default=None)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    if args.per_example:
        per_example_path = Path(args.per_example).expanduser().resolve()
        summary = _load_json(args.summary)
    else:
        per_example_path, summary = evaluate_checkpoint(args)

    rows = load_prediction_rows(per_example_path)
    payload = build_canton_payload(rows, checkpoint_path=args.checkpoint, split=args.split, summary=summary)
    payload["meta"]["evaluation_settings"] = {
        "batch_size": args.batch_size,
        "num_workers": args.num_workers,
        "num_samples": args.num_samples,
        "num_steps": args.num_steps,
        "cfg_rate": args.cfg_rate,
        "device": args.device,
        "note": "Null values use the experiment config defaults.",
    }
    output_path = write_payload(payload, args.output)
    print(
        json.dumps(
            {
                "output_path": str(output_path),
                "per_example_path": str(per_example_path),
                "regions": len(payload["regions"]),
                "total_count": payload["meta"]["total_count"],
                "checkpoint_path": payload["meta"]["checkpoint_path"],
                "checkpoint_epoch": payload["meta"]["checkpoint_epoch"],
                "unmatched_regions": payload["meta"]["unmatched_regions"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
