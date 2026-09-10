# Parquet scan fixtures

`scan-int64.parquet`, `scan-string.parquet`, and `scan-unsorted.parquet` are synthetic, locally generated
fixtures: 24 rows, four row groups, sorted H3-shaped identifiers, nullable numeric
metrics, row labels, and a deliberately unselected payload column. Both use Snappy
compression, row-group statistics, and page indexes. The identifiers are consecutive
numbers starting at `862830807ffffff`; these tests exercise Parquet range filtering,
not geographic validity. The unsorted variant permutes identifiers within and
across row groups to exercise exact filtering when time-major data resets H3 order.

Regenerate using Python with `pyarrow==25.0.1` installed:

```sh
python3 components/globe/utils/__fixtures__/generate-parquet.py
```

PyArrow is needed only for regeneration. The committed fixtures make the tests
independent of network access and Python dependencies. Tests compare the column scan
with hyparquet's public row reader, including delayed reads, projection, pruning,
nullable predicates, both H3 physical representations, and cancellation.
