export interface RegionScore {
  name: string;
  score: number;
}

export interface HNCRow {
  image_id: string;
  captured_at: Date | number | bigint | null;
  compass_angle: number | null;
  camera_type: string | null;
  image_mime: string | null;
  lon: number;
  lat: number;
  top_regions: RegionScore[];
}

export interface HNCHeavy {
  blobUrl: string | null;
  brainActivity: Float32Array | null;
}
