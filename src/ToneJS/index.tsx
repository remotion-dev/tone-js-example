import {useCallback, useEffect, useState} from 'react';
import {
	AbsoluteFill,
	Audio,
	continueRender,
	delayRender,
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import * as Tone from 'tone';
import {audioBufferToDataUrl} from '@remotion/media-utils';
import {Note} from './Note';
import {EndCard} from './EndCard';

const notesSequence = [
	'E4',
	'E4',
	'E4',
	'E4',
	'E4',
	'E4',
	'E4',
	'G4',
	'C4',
	'D4',
	'E4',
	'F4',
	'F4',
	'F4',
	'F4',
	'F4',
	'E4',
	'E4',
	'E4',
	'E4',
	'E4',
	'D4',
	'D4',
	'E4',
	'D4',
	'D4',
	'E4',
	'D4',
	'G4',
	'E4',
	'E4',
	'E4',
	'E4',
	'E4',
	'E4',
	'E4',
	'G4',
	'C4',
	'D4',
	'E4',
	'F4',
	'F4',
	'F4',
	'F4',
	'F4',
	'E4',
	'E4',
	'E4',
	'E4',
	'G4',
	'G4',
	'F4',
	'D4',
	'C4',
].map((note) => ({note, duration: '8n'}));

export const ToneJS: React.FC = () => {
	const frame = useCurrentFrame();
	const [handle] = useState(() => delayRender());
	const [audioBuffer, setAudioBuffer] = useState<string | null>(null);
	const {fps, durationInFrames} = useVideoConfig();

	const lengthInSeconds = durationInFrames / fps;

	const renderAudio = useCallback(async () => {
		const toneBuffer = await Tone.Offline(() => {
			const synth = new Tone.Synth().toDestination();
			const now = Tone.now();
			let accumulatedTime = 0;
			notesSequence.forEach((sequenceItem) => {
				accumulatedTime += Tone.Time(sequenceItem.duration).toSeconds();
				synth.triggerAttackRelease(
					sequenceItem.note,
					sequenceItem.duration,
					now + accumulatedTime
				);
			});
		}, lengthInSeconds);

		const buffer = toneBuffer.get() as AudioBuffer;
		setAudioBuffer(audioBufferToDataUrl(buffer));

		continueRender(handle);
	}, [handle, lengthInSeconds]);

	useEffect(() => {
		renderAudio();
	}, [renderAudio]);

	let accumulatedFrames = 0;
	const sequenceWithFrames = notesSequence.map((sequenceItem) => {
		accumulatedFrames += Tone.Time(sequenceItem.duration).toSeconds() * fps;
		return {
			note: sequenceItem.note,
			midiNote: Tone.Midi(sequenceItem.note).toMidi(),
			frame: accumulatedFrames,
		};
	});

	const transition = spring({
		fps,
		frame: frame - 440,
		config: {
			damping: 200,
		},
	});

	const rotateY = interpolate(transition, [0, 0.5], [0, Math.PI / 2], {
		extrapolateRight: 'clamp',
		extrapolateLeft: 'clamp',
	});
	const rotateY2 = interpolate(transition, [0.5, 1], [-Math.PI / 2, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
			}}
		>
			<Sequence durationInFrames={450} from={0}>
				<AbsoluteFill
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						transform: `rotateY(${rotateY}rad)`,
					}}
				>
					{sequenceWithFrames
						.filter((sequenceItem) => frame > sequenceItem.frame)
						.slice(-1)
						.map((sequenceItem, i) => {
							return (
								<Sequence
									key={i}
									from={Math.round(sequenceItem.frame)}
									layout="none"
								>
									<Note note={sequenceItem.note} />
								</Sequence>
							);
						})}
				</AbsoluteFill>
			</Sequence>
			{audioBuffer && <Audio src={audioBuffer} startFrom={0} />}
			<Sequence from={440}>
				<AbsoluteFill
					style={{
						transform: `rotateY(${rotateY2}rad)`,
					}}
				>
					<EndCard />
				</AbsoluteFill>
			</Sequence>
		</AbsoluteFill>
	);
};

export default ToneJS;
