import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

import { useContext, useEffect, useState } from 'react';
import { minitelContext } from 'minitel-react';

export function VideoApp() {
  const minitel = useContext(minitelContext);
  
  const [curFrame, setCurFrame] = useState<number[][][]>([[[0, 0, 0]]]);

  useEffect(() => {
    let stopped = false;

    (async () => {
      ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
      let playingAt: number | false = false;
      
      const url = 'https://www.youtube.com/watch?v=FtutLA63Cp8'; // Replace with your YouTube video URL

      let play: () => Promise<void>;
      let frameRate = 30;
      
      // Function to extract and handle video frames
      function handleVideoFrames(stream: Parameters<typeof ffmpeg>[0]) {
        let frameBuffer: Buffer[] = [];
        let allImages = 0;
        let prevAcc: Buffer[] = [];

        const stuff = { frameBuffer, width: 0, height: 0 };
          
        let imageLength: number;

        let command = ffmpeg(stream)
          .outputOptions([
            // '-movflags', 'frag_keyframe+empty_moov',
            '-f', 'image2pipe',
            '-vcodec', 'rawvideo',
            '-pix_fmt', 'rgb24'
          ])
          .outputFps(30)
          .on('error', (...err) => {
            console.error('Error processing video frames:', err);
          })
        // .on('codecData', (a) => frameRate = parseInt(a.video_details[5]));
        // .on('progress', (a) => console.log(a));

        command
          .pipe()
          .on('data', (data: Buffer) => {
            data = Buffer.concat([...prevAcc, data]);
            prevAcc.length = 0;
            let currPos = 0;
            if (imageLength != null) {
              while (data.length >= currPos + imageLength) {
                const chunk = data.subarray(currPos, currPos + imageLength);
                // console.log(chunk);
                frameBuffer.push(chunk);
                currPos += imageLength;
                allImages += 1;
              }
            }
            prevAcc.push(data.subarray(currPos));
            // console.log('Frame', allImages, 'we at', allImages / 30);
          });

        command
          .ffprobe((err, metadata) => {
            if (err) throw err;
            imageLength = metadata.streams[0].width! * metadata.streams[0].height! * 3;
            stuff.width = metadata.streams[0].width!;
            stuff.height = metadata.streams[0].height!;
            // console.log(metadata)
            // playAudio(stream);
            play();
            playingAt = Date.now();
          });

        // Expose a method to get the current frame buffer
        return stuff;
      }
      
      // Start the streaming process
      const videoStream = (await ytdl.getInfo(url)).formats.find((v) => v.qualityLabel?.match(/144|240|270|360|480/))?.url;

      // Handle video frames
      const stuff = handleVideoFrames(videoStream!);

      let lastFrame = 0;

      play = async function (): Promise<any> {
        if (stuff.frameBuffer.length < 1 || !playingAt || playingAt > Date.now()) return setTimeout(play, 100);
        const weAt = Math.floor((Date.now() - playingAt) / (1000 / frameRate)) - lastFrame;
        
        lastFrame += weAt;

        const frame = stuff.frameBuffer[weAt];
        if (!frame) return setTimeout(play, 100);

        stuff.frameBuffer.splice(0, weAt);
        // console.log('elo');
        if (weAt !== 0) {
          const curFrame: number[][][] = [];
          for (let y = 0; y < stuff.height; y += (stuff.height - 1) / 72) {
            const line: number[][] = [];
            for (let x = 0; x < stuff.width; x += (stuff.width - 1) / 80) {
              const colorTriplet: number[] = [];
              for (let i = 0; i < 3; i += 1) {
                colorTriplet.push(frame[Math.floor(Math.floor(y) * stuff.width + x) * 3 + i]);
              }
              // console.log(colorTriplet, x, y);
              line.push(colorTriplet);
            }
            curFrame.push(line);
          }
          // console.log('new curFrame js dropped');
          setCurFrame(curFrame);
          // console.log(Date.now() - videoStart);
          await minitel.queueCommandAsync('\x1b\x39\x70', '\x1b\x3a\x71')
        } else {
          await new Promise<void>((r) => setTimeout(() => r(), (1000 / frameRate / 2)));
        }
        // await minitel.lastRender;
        if (!stopped) play();
      }
    })();

    return () => stopped = true;
  }, []);

  return (
    <yjoin>
      <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Video player</para>
      <xjoin bg={5} widthAlign='middle' heightAlign='middle'>
        <image imageData={curFrame} />
      </xjoin>
    </yjoin>
  );
}
