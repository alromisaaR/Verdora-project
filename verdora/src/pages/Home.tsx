import React from "react";
import { Helmet} from 'react-helmet-async';
import MainSlider from "../components/Home/MainSlider/MainSlider";
import CategorySlider from "../components/Home/CategorySection/CategorySection";
import LowestProducts from "../components/Home/LowestProducts/LowestProducts";
import About from "../components/Home/About/About";
import ExploreProducts from "../components/Home/ExploreProducts/ExploreProducts";
import PlantQuiz from "../components/PlantQuiz";

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Verdora | Home</title>
      </Helmet>

      <MainSlider />
      <PlantQuiz />
      <CategorySlider />
      <LowestProducts />
      <ExploreProducts />
      <About />
    </>
  );
};

export default HomePage;
