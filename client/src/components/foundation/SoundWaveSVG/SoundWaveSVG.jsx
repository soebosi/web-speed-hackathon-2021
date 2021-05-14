import React from 'react';

function map(list, func) {
  return list.map(func);
}

function zip(...arrays) {
  const maxLength = Math.max(...arrays.map((x) => x.length));
  return Array.from({ length: maxLength }).map((_, i) => {
    return Array.from({ length: arrays.length }, (_, k) => arrays[k][i]);
  });
}

function mean(array) {
  return array.reduce((p, c) => p + c, 0) / array.length;
}

function _max(arr) {
  return Math.max(...arr);
}

function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_v, i) => arr.slice(i * size, i * size + size));
}

/**
 * @typedef {object} Props
 * @property {ArrayBuffer} soundData
 */

/**
 * @type {React.VFC<Props>}
 */
const SoundWaveSVG = ({ soundData }) => {
  const uniqueIdRef = React.useRef(Math.random().toString(16));
  const [{ max, peaks }, setPeaks] = React.useState({ max: 0, peaks: [] });

  React.useEffect(async () => {
    const audioCtx = new AudioContext();

    // 音声をデコードする
    /** @type {AudioBuffer} */
    const buffer = await new Promise((resolve, reject) => {
      audioCtx.decodeAudioData(soundData.slice(0), resolve, reject);
    });
    // 左の音声データの絶対値を取る
    const leftData = map(buffer.getChannelData(0), Math.abs);
    // 右の音声データの絶対値を取る
    const rightData = map(buffer.getChannelData(1), Math.abs);

    // 左右の音声データの平均を取る
    const normalized = map(zip(leftData, rightData), mean);
    // 100 個の chunk に分ける
    const chunks = chunk(normalized, Math.ceil(normalized.length / 100));
    // chunk ごとに平均を取る
    const peaks = map(chunks, mean);
    // chunk の平均の中から最大値を取る
    const max = _max(peaks);

    setPeaks({ max, peaks });
  }, [soundData]);

  return (
    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 1">
      {peaks.map((peak, idx) => {
        const ratio = peak / max;
        return (
          <rect
            key={`${uniqueIdRef.current}#${idx}`}
            fill="#2563EB"
            height={ratio}
            stroke="#EFF6FF"
            strokeWidth="0.01"
            width="1"
            x={idx}
            y={1 - ratio}
          />
        );
      })}
    </svg>
  );
};

export { SoundWaveSVG };
