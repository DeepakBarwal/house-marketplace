import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../config/firebase.config";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Spinner from "./Spinner";

const Slider = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, "listings");
        const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
        const querySnap = await getDocs(q);
        let listingsArr = [];

        querySnap.forEach((doc) => {
          return listingsArr.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listingsArr);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchListings();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (listings.length === 0) {
    return <></>;
  }

  return (
    listings && (
      <>
        <p className="exploreHeading">Recommended</p>

        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          slidesPerView={1}
          pagination={{ clickable: true }}
        >
          {listings.map(({ data, id }) => {
            return (
              <SwiperSlide
                key={id}
                onClick={() => navigate(`/category/${data.type}/${id}`)}
              >
                <img
                  src={data.imgUrls[0]}
                  alt="listing"
                  className="swiperSlideDiv"
                  style={{
                    background: `center no-repeat`,
                    backgroundSize: "cover",
                    display: "inline-block",
                    minHeight: "20rem",
                    maxHeight: "40rem",
                  }}
                />
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  ₹{" "}
                  {data.discountedPrice
                    ?.toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ??
                    data.regularPrice
                      ?.toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  {data.type === "rent" && " / Month"}
                </p>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </>
    )
  );
};

export default Slider;
