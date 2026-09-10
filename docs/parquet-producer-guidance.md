# Parquet producer and hosting guidance

The indices browser reads selected columns and spatial ranges directly from remote Parquet. File layout and HTTP behavior determine how much work the client can skip. This guide states requirements and measurement steps; it does not claim that every currently published dataset has the recommended layout.

## File layout

- Keep `h3_index` in a lossless representation. INT64 supports the current numeric statistics predicates; JavaScript must retain it as `bigint`.
- Sort H3 values so row-group min/max statistics describe useful spatial ranges. Write valid statistics for filter columns.
- Balance row-group size against metadata/request overhead using actual viewports. One large row group offers little row-group pruning; many tiny groups add overhead. There is no universally optimal row count.
- Include Parquet column and offset indexes when supported by the producer. The reader enables `usePageIndex: true`, but cannot manufacture indexes missing from the file.
- Keep frequently requested metric columns separate from heavy payloads. Column projection only helps when unrelated content can remain unread.
- Publish immutable, versioned URLs for releases. Reader metadata and byte caches assume an object does not change beneath the same URL during a session.

Parquet's `ColumnIndex` describes page statistics; `OffsetIndex` locates pages and their row positions. Both matter for selective page reads. `index_page_offset` is not proof that modern column/offset indexes exist or are absent. Inspect the actual column-index and offset-index metadata. See the [Apache Parquet page index specification](https://parquet.apache.org/docs/file-format/pageindex/).

Use writer options documented by the exact producer version. The previous guide included unverified DuckDB SQL flags; those examples were removed. Validate produced files rather than assuming an option enabled the intended indexes. Bloom filters generally target equality lookups; they are not a replacement for ordered range statistics.

## HTTP contract

The data host must allow browser cross-origin reads and honor byte-range requests over stable Parquet bytes. Validate HEAD/file length and a small Range GET, including the returned status, `Content-Range`, and actual body length. Expose response headers required by the reader through CORS. The [hyparquet remote buffer API](https://github.com/hyparam/hyparquet#asyncbufferfromurl) explains range reads and the optional known file size.

Transparent HTTP gzip/Brotli compression can make HEAD `Content-Length` refer to compressed transport bytes while browser fetch returns a decompressed body. Byte offsets must describe the representation that the range reader actually receives. Do not confuse this with Parquet's internal ZSTD/Snappy compression, which the reader decodes normally.

Hormones & Cities currently uses an in-memory full-file read to handle its hosted file's compression behavior. The Source Cooperative indices worker uses remote ranges; verify the actual endpoint before reusing either strategy.

## Producer validation

For representative whole-globe and city viewports at each resolution:

1. Inspect schema, row count, sort order, row-group sizes, codecs, min/max statistics, and page-index metadata.
2. Compare filtered output to an exact full-read reference, including H3 boundary values, missing metrics, and multiple row groups.
3. Record cold-cache bytes, requests, first result, completion time, and peak memory on the intended browser/device.
4. Change one layout variable, republish under a new URL, and repeat the same measurements.

The client performs exact filtering after storage pruning, so a broader retained range affects performance rather than deliberately weakening query correctness. Files with missing indexes remain readable but can require substantially more I/O and decoding. See [indices](indices.md) for client implementation and remaining cost boundaries.
