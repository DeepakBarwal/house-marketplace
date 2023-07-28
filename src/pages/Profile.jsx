import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, updateProfile } from "firebase/auth";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase.config";
import { toast } from "react-toastify";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/homeIcon.svg";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

const Profile = () => {
  const auth = getAuth();
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const [changeDetails, setChangeDetails] = useState(false);
  const navigate = useNavigate();

  const { name, email } = formData;

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const listingsRef = collection(db, "listings");

        const q = query(
          listingsRef,
          where("userRef", "==", auth.currentUser.uid),
          orderBy("timestamp", "desc")
        );

        const querySnap = await getDocs(q);

        const listingsArr = [];

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
    fetchUserListings();
  }, [auth.currentUser.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        // Update displayName in FB
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // Update doc in firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    } catch (error) {
      toast.error("Could not update profile details");
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...formData,
      [e.target.id]: e.target.value,
    }));
  };

  const onDelete = async (listingId) => {
    try {
      if (window.confirm("Are you sure you want to delete?")) {
        await deleteDoc(doc(db, "listings", listingId));
        const updatedListings = listings.filter(
          (listing) => listing.id !== listingId
        );
        setListings(updatedListings);
        toast.success("Successfully deleted listing");
      }
    } catch (error) {
      toast.error("Error deleting listing");
    }
  };

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`);

  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? "done" : "change"}
          </p>
        </div>

        <div className="profileCard">
          <form>
            <input
              id="name"
              type="text"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            {/* <input
              id="email"
              type="text"
              className={!changeDetails ? "profileEmail" : "profileEmailActive"}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            /> */}
            <input
              id="email"
              type="email"
              className="profileEmail"
              disabled={true}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>

        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onEdit={() => onEdit(listing.id)}
                  onDelete={() => onDelete(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
