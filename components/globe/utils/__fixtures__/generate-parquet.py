"""Regenerate with Python and pyarrow 25.0.1; pyarrow is not a project dependency."""

from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

destination = Path(__file__).parent
base = int("862830807ffffff", 16)
metrics = [None, -3.0, 0.0, 2.0, 9.0, -1.0] * 4
for kind in ("int64", "string", "unsorted"):
    indices = [base + i for i in range(24)]
    if kind == "unsorted":
        indices = [base + (i * 7) % 24 for i in range(24)]
    h3 = pa.array([f"{i:x}" for i in indices]) if kind == "string" else pa.array(indices, type=pa.int64())
    table = pa.table({
        "h3_index": h3,
        "metric": pa.array(metrics, type=pa.float64()),
        "label": [f"row-{i:02}" for i in range(24)],
        "unused_payload": [f"unused-{i}:" + "x" * 128 for i in range(24)],
    })
    pq.write_table(
        table,
        destination / f"scan-{kind}.parquet",
        row_group_size=6,
        compression="snappy",
        write_statistics=True,
        write_page_index=True,
    )
