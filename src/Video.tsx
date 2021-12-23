import {Composition} from 'remotion';
import ToneJS from './ToneJS';

export const RemotionVideo: React.FC = () => {
	return (
		<>
			<Composition
				id="tone"
				component={ToneJS}
				durationInFrames={550}
				fps={30}
				width={1080}
				height={1080}
			/>
		</>
	);
};
