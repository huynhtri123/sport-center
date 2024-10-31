import React from 'react';
import { useParams } from 'react-router-dom';
import SportHome from './SportHome';
import sportData from '../../../../data/sportData';

const DynamicSportHome = () => {
    const { sportName } = useParams();
    // console.log(sportName);
    const sport = sportData.find((item) => item.key === sportName);

    if (!sport) {
        return <p>Sport not found!</p>;
    }

    return (
        <SportHome
            title={sport.title}
            description={sport.description}
            linkTo={sport.linkTo}
            fieldType={sport.fieldType}
            bannerImage={sport.bannerImage}
            features={sport.features}
            className={sport.className}
        />
    );
};

export default DynamicSportHome;
