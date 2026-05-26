from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest


WEB_ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = WEB_ROOT / "scripts/build_canton_prediction_data.py"
SPEC = importlib.util.spec_from_file_location("build_canton_prediction_data", MODULE_PATH)
assert SPEC and SPEC.loader
builder = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = builder
SPEC.loader.exec_module(builder)


def sample_rows() -> list[dict]:
    return [
        {
            "sample_id": "images/test/a",
            "split": "test",
            "region": "Zurich",
            "ground_truth_lat": 47.3769,
            "ground_truth_lon": 8.5417,
            "mode_lat": 47.3769,
            "mode_lon": 8.5417,
            "mode_distance_km": 0.0,
            "image_path": "/absolute/path/a.jpg",
            "sub_region": "Zurich District",
            "city": "Zurich",
        },
        {
            "sample_id": "images/test/b",
            "split": "test",
            "region": "St. Gallen",
            "ground_truth_lat": 47.4245,
            "ground_truth_lon": 9.3767,
            "mode_lat": 47.31,
            "mode_lon": 9.2,
            "mode_distance_km": 18.5,
            "image_path": "/absolute/path/b.jpg",
            "sub_region": "St. Gallen",
            "city": "St. Gallen",
        },
        {
            "sample_id": "images/test/c",
            "split": "test",
            "region": "Neuchatel",
            "ground_truth_lat": 46.99,
            "ground_truth_lon": 6.93,
            "mode_lat": 46.0,
            "mode_lon": 8.1,
            "mode_distance_km": 130.0,
            "image_path": "/absolute/path/c.jpg",
            "sub_region": "Neuchatel",
            "city": "Neuchatel",
        },
    ]


class CantonPredictionDataBuilderTest(unittest.TestCase):
    def test_build_payload_groups_aliases_and_removes_absolute_paths(self) -> None:
        payload = builder.build_canton_payload(
            sample_rows(),
            checkpoint_path="/tmp/checkpoint_best.pt",
            split="test",
            summary={"checkpoint": {"epoch": 5}},
            generated_at="2026-05-26T00:00:00Z",
        )

        regions = {region["id"]: region for region in payload["regions"]}

        self.assertEqual(payload["meta"]["total_count"], 3)
        self.assertEqual(payload["meta"]["checkpoint_epoch"], 5)
        self.assertEqual(len(payload["regions"]), 26)
        self.assertEqual(regions["ZH"]["count"], 1)
        self.assertEqual(regions["SG"]["count"], 1)
        self.assertEqual(regions["NE"]["count"], 1)
        self.assertEqual(regions["ZH"]["accuracy_at_25km"], 1.0)
        self.assertEqual(regions["NE"]["accuracy_at_100km"], 0.0)
        self.assertNotIn("image_path", regions["ZH"]["points"][0])
        self.assertEqual(regions["ZH"]["points"][0]["sample_id"], "images/test/a")

    def test_load_prediction_rows_validates_required_fields(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "bad.jsonl"
            path.write_text(json.dumps({"ground_truth_lat": 47.0}) + "\n", encoding="utf-8")

            with self.assertRaises(ValueError):
                builder.load_prediction_rows(path)


if __name__ == "__main__":
    unittest.main()
