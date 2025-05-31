// src/guide/Guide.tsx
import Joyride, { STATUS, CallBackProps } from 'react-joyride';
import { TOUR_STEPS } from './steps';
import { useTour } from '../contexts/TourContext';

export const Guide: React.FC = () => {
  const { seen, complete } = useTour();

  if (seen) return null;

  const handle = (data: CallBackProps) => {
    const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(data.status!);
    if (finished) complete();
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      callback={handle}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: '#6366f1', // indigo-500
          zIndex: 10000,
        },
      }}
    />
  );
};
