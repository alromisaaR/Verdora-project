import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./quiz.css";

type Product = {
  id: number | string;
  name: string;
  image?: string;
  category?: string;
  care?: string;
  size?: string;
  light?: string;
  maintenance?: string;
  environment?: string;
  type?: string;
};

const PlantQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ 
    experience: string; 
    light: string; 
    space: string;
    style: string;
  }>({
    experience: "",
    light: "",
    space: "",
    style: ""
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [badgeHovered, setBadgeHovered] = useState(false);

  const navigate = useNavigate();
  const productsPerPage = 2;

  const quizQuestions = [
    {
      question: "What's your experience with plants?",
      key: "experience",
      options: [
        { 
          label: "Beginner", 
          value: "beginner", 
          icon: "🌱",
          description: "My first plant"
        },
        { 
          label: "Intermediate", 
          value: "intermediate", 
          icon: "🌿",
          description: "I've had a few plants"
        },
        { 
          label: "Expert", 
          value: "expert", 
          icon: "🌳",
          description: "Green thumb"
        },
      ],
    },
    {
      question: "How much light does your space get?",
      key: "light",
      options: [
        { 
          label: "Low light", 
          value: "low", 
          icon: "💡",
          description: "North-facing room"
        },
        { 
          label: "Medium light", 
          value: "medium", 
          icon: "🪟",
          description: "Indirect sunlight"
        },
        { 
          label: "Bright light", 
          value: "bright", 
          icon: "☀️",
          description: "South-facing window"
        },
      ],
    },
    {
      question: "How much space do you have?",
      key: "space",
      options: [
        { 
          label: "Small space", 
          value: "small", 
          icon: "🪴",
          description: "Desk or shelf"
        },
        { 
          label: "Medium space", 
          value: "medium", 
          icon: "🏠",
          description: "Table or stand"
        },
        { 
          label: "Large space", 
          value: "large", 
          icon: "🌿",
          description: "Floor area"
        },
      ],
    },
    {
      question: "What's your plant style?",
      key: "style",
      options: [
        { 
          label: "Flowering plants", 
          value: "flowering", 
          icon: "🌸",
          description: "Colorful blooms"
        },
        { 
          label: "Foliage plants", 
          value: "foliage", 
          icon: "🌿",
          description: "Beautiful leaves"
        },
        { 
          label: "Succulents", 
          value: "succulent", 
          icon: "🌵",
          description: "Low maintenance"
        },
      ],
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5005/products")
      .then((res) => res.json())
      .then((data) => {
        const enhancedProducts = Array.isArray(data) ? data.map(product => {
          let type = "foliage";
          if (product.name?.toLowerCase().includes('cactus') || 
              product.name?.toLowerCase().includes('succulent') ||
              product.category?.includes('succulent')) {
            type = "succulent";
          } else if (product.name?.toLowerCase().includes('lily') ||
                    product.name?.toLowerCase().includes('orchid') ||
                    product.name?.toLowerCase().includes('flower') ||
                    product.category?.includes('flowering')) {
            type = "flowering";
          }

          let lightReq = "medium";
          if (product.care?.toLowerCase().includes('direct sun') ||
              product.care?.toLowerCase().includes('bright light')) {
            lightReq = "bright";
          } else if (product.care?.toLowerCase().includes('low light') ||
                    product.care?.toLowerCase().includes('shade')) {
            lightReq = "low";
          }

          let maintenance = "intermediate";
          if (product.care?.toLowerCase().includes('easy') ||
              product.care?.toLowerCase().includes('low maintenance')) {
            maintenance = "beginner";
          } else if (product.care?.toLowerCase().includes('difficult') ||
                    product.care?.toLowerCase().includes('high maintenance')) {
            maintenance = "expert";
          }

          let size = "medium";
          if (product.size?.toLowerCase().includes('small') ||
              product.name?.toLowerCase().includes('mini')) {
            size = "small";
          } else if (product.size?.toLowerCase().includes('large') ||
                    product.name?.toLowerCase().includes('tree')) {
            size = "large";
          }

          return {
            ...product,
            type: type,
            light: lightReq,
            maintenance: maintenance,
            environment: size
          };
        }) : [];
        
        setProducts(enhancedProducts);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        const mockProducts: Product[] = [
          { 
            id: 1, 
            name: "Snake Plant", 
            category: "foliage", 
            care: "Easy care, low light", 
            size: "Medium", 
            type: "foliage", 
            light: "low", 
            maintenance: "beginner",
            environment: "medium",
            image: "/api/placeholder/120/120"
          },
          { 
            id: 2, 
            name: "Peace Lily", 
            category: "flowering", 
            care: "Moderate care, medium light", 
            size: "Small", 
            type: "flowering", 
            light: "medium", 
            maintenance: "intermediate",
            environment: "small",
            image: "/api/placeholder/120/120"
          },
          { 
            id: 3, 
            name: "Fiddle Leaf Fig", 
            category: "tree", 
            care: "Difficult care, bright light", 
            size: "Large", 
            type: "foliage", 
            light: "bright", 
            maintenance: "expert",
            environment: "large",
            image: "/api/placeholder/120/120"
          },
          { 
            id: 4, 
            name: "Spider Plant", 
            category: "foliage", 
            care: "Easy care, medium light", 
            size: "Small", 
            type: "foliage", 
            light: "medium", 
            maintenance: "beginner",
            environment: "small",
            image: "/api/placeholder/120/120"
          },
          { 
            id: 5, 
            name: "Orchid", 
            category: "flowering", 
            care: "Difficult care, bright light", 
            size: "Medium", 
            type: "flowering", 
            light: "bright", 
            maintenance: "expert",
            environment: "medium",
            image: "/api/placeholder/120/120"
          },
          { 
            id: 6, 
            name: "ZZ Plant", 
            category: "foliage", 
            care: "Easy care, low light", 
            size: "Medium", 
            type: "foliage", 
            light: "low", 
            maintenance: "beginner",
            environment: "medium",
            image: "/api/placeholder/120/120"
          },
          { 
            id: 7, 
            name: "Cactus", 
            category: "succulent", 
            care: "Easy care, bright light", 
            size: "Small", 
            type: "succulent", 
            light: "bright", 
            maintenance: "beginner",
            environment: "small",
            image: "/api/placeholder/120/120"
          },
          { 
            id: 8, 
            name: "Pothos", 
            category: "foliage", 
            care: "Easy care, low light", 
            size: "Small", 
            type: "foliage", 
            light: "low", 
            maintenance: "beginner",
            environment: "small",
            image: "/api/placeholder/120/120"
          },
          { 
            id: 9, 
            name: "Rubber Plant", 
            category: "tree", 
            care: "Moderate care, medium light", 
            size: "Large", 
            type: "foliage", 
            light: "medium", 
            maintenance: "intermediate",
            environment: "large",
            image: "/api/placeholder/120/120"
          },
        ];
        setProducts(mockProducts);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (value: string) => {
    setSelectedOption(value);
    const key = quizQuestions[currentQuestion].key as keyof typeof answers;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelectedOption(null);
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion((s) => s + 1);
      } else {
        const filtered = products.filter((product) => {
          let matchScore = 0;

          if (newAnswers.experience === "beginner" && product.maintenance === "beginner") matchScore += 2;
          if (newAnswers.experience === "intermediate" && product.maintenance === "intermediate") matchScore += 2;
          if (newAnswers.experience === "expert" && product.maintenance === "expert") matchScore += 2;
          if (newAnswers.experience === "beginner" && product.maintenance === "intermediate") matchScore += 1;

          if (newAnswers.light === "low" && product.light === "low") matchScore += 2;
          if (newAnswers.light === "medium" && product.light === "medium") matchScore += 2;
          if (newAnswers.light === "bright" && product.light === "bright") matchScore += 2;
          if (newAnswers.light === "medium" && (product.light === "low" || product.light === "bright")) matchScore += 1;

          if (newAnswers.space === "small" && product.environment === "small") matchScore += 2;
          if (newAnswers.space === "medium" && product.environment === "medium") matchScore += 2;
          if (newAnswers.space === "large" && product.environment === "large") matchScore += 2;
          if (newAnswers.space === "medium" && (product.environment === "small" || product.environment === "large")) matchScore += 1;

          if (newAnswers.style === "flowering" && product.type === "flowering") matchScore += 2;
          if (newAnswers.style === "foliage" && product.type === "foliage") matchScore += 2;
          if (newAnswers.style === "succulent" && product.type === "succulent") matchScore += 2;

          return matchScore >= 4;
        });

        const finalResults = filtered.length > 0 
          ? filtered 
          : products.filter(p => p.maintenance === "beginner").slice(0, 6);

        setResults(finalResults);
        setQuizCompleted(true);
        setBadgeVisible(true);
        setCurrentPage(1);
      }
    }, 500);
  };

  const openOverlay = () => {
    setOverlayOpen(true);
    if (quizCompleted) {
      setCurrentQuestion(0);
      setAnswers({ experience: "", light: "", space: "", style: "" });
      setResults([]);
      setQuizCompleted(false);
    }
  };

  const closeOverlay = () => setOverlayOpen(false);

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({ experience: "", light: "", space: "", style: "" });
    setResults([]);
    setQuizCompleted(false);
    setOverlayOpen(true);
  };

  const totalPages = Math.ceil(results.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedResults = results.slice(startIndex, startIndex + productsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <>
      {/* Floating Badge */}
      {badgeVisible && (
        <div
          className={`floating-badge ${quizCompleted ? "completed" : ""} ${
            badgeHovered ? "hovered" : ""
          }`}
          onClick={openOverlay}
          onMouseEnter={() => setBadgeHovered(true)}
          onMouseLeave={() => setBadgeHovered(false)}
        >
          <div className="badge-content">
            <div className="badge-emoji">
              {badgeHovered ? "🌿" : "🪴"}
            </div>
            <span className="badge-text">
              {quizCompleted ? "See Results" : "Find Your Plant"}
            </span>
          </div>
        </div>
      )}

      {/* Overlay */}
      {overlayOpen && (
        <div className="modern-overlay" onClick={closeOverlay}>
          <div className="quiz-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="quiz-header">
              <div className="header-content">
                <h1 className="quiz-title">Plant Match</h1>
              </div>
              <button className="modern-close" onClick={closeOverlay}>
                <span>×</span>
              </button>
            </div>

            <div className="quiz-content">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Finding your perfect plant matches...</p>
                </div>
              ) : results.length === 0 && !quizCompleted ? (
                <div className="question-flow">
                  {/* Progress */}
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      Question {currentQuestion + 1} of {quizQuestions.length}
                    </span>
                  </div>

                  {/* Question */}
                  <div className="question-card">
                    <h2 className="question-text">{quizQuestions[currentQuestion].question}</h2>
                    
                    <div className="options-layout">
                      {quizQuestions[currentQuestion].options.map((opt) => (
                        <div
                          key={opt.value}
                          className={`modern-option ${selectedOption === opt.value ? "selected" : ""}`}
                          onClick={() => handleAnswer(opt.value)}
                        >
                          <div className="option-icon">{opt.icon}</div>
                          <div className="option-content">
                            <span className="option-label">{opt.label}</span>
                            <span className="option-description">{opt.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="results-view">
                  {/* Results Header */}
                  <div className="results-header">
                    <h2>Your Perfect Plant Matches!</h2>
                  </div>
                  {/* Products Grid */}
                  <div className="products-grid-single-row">
                    {paginatedResults.map((product) => (
                      <div
                        key={product.id}
                        className="product-card-single"
                        onClick={() => {
                          closeOverlay();
                          navigate(`/product/${product.id}`);
                        }}
                      >
                        <div className="product-image-single">
                          <div className="image-container">
                            <img 
                              src={product.image || "/api/placeholder/120/120"} 
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="image-fallback hidden"></div>
                          </div>
                        </div>
                        <div className="product-name-single">{product.name}</div>
                        <div className="product-type">
                          {product.type === 'flowering' ? '🌸 Flowering' : 
                           product.type === 'succulent' ? '🌵 Succulent' : ' Foliage'}
                        </div>
                        <div className="product-care">{product.care}</div>
                      </div>
                    ))}
                  </div>
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination-modern">
                      <button 
                        className="pagination-arrow"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        ‹
                      </button>
                      
                      <div className="page-numbers-modern">
                        {getPageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                          ) : (
                            <button
                              key={page}
                              className={`page-number-modern ${currentPage === page ? 'active' : ''}`}
                              onClick={() => setCurrentPage(page as number)}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      
                      <button 
                        className="pagination-arrow"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlantQuiz;