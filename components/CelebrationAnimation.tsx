'use client';

import { useEffect, useState } from 'react';

interface CelebrationAnimationProps {
  show: boolean;
  isWinner?: boolean;
  isDraw?: boolean;
  onComplete?: () => void;
}

export default function CelebrationAnimation({ 
  show, 
  isWinner = false, 
  isDraw = false,
  onComplete 
}: CelebrationAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      
      {/* Celebration Content */}
      <div className="relative z-10 text-center">
        {/* Trophy/Emoji Animation */}
        <div className="animate-bounce-in mb-4">
          {isWinner ? (
            <div className="text-8xl sm:text-9xl animate-trophy-spin">
              🏆
            </div>
          ) : isDraw ? (
            <div className="text-8xl sm:text-9xl animate-bounce">
              🤝
            </div>
          ) : (
            <div className="text-8xl sm:text-9xl animate-bounce">
              🎉
            </div>
          )}
        </div>

        {/* Confetti Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Text Animation */}
        <div className="animate-slide-up">
          <h2 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-2 ${
            isWinner ? 'text-yellow-400' : isDraw ? 'text-blue-400' : 'text-white'
          }`}>
            {isWinner ? '🎊 You Win! 🎊' : isDraw ? "It's a Draw!" : 'Game Over!'}
          </h2>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes trophy-spin {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-10deg) scale(1.1);
          }
          75% {
            transform: rotate(10deg) scale(1.1);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-trophy-spin {
          animation: trophy-spin 1s ease-in-out infinite;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}
