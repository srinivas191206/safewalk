import { useState, useEffect } from 'react';
import Home from './Home';
import Onboarding from './Onboarding';

const Index = () => {
  const [isOnboarded, setIsOnboarded] = useState(() => 
    localStorage.getItem('guardian_onboarded') === 'true'
  );

  const handleOnboardingComplete = () => {
    localStorage.setItem('guardian_onboarded', 'true');
    setIsOnboarded(true);
  };

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return <Home />;
};

export default Index;
