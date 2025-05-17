import React from 'react';
import LearningPlan from '../components/learning-plan/LearningPlan';

const LearningPlanPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <LearningPlan />
      </div>
    </div>
  );
};

export default LearningPlanPage; 