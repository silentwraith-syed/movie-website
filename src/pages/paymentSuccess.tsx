import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


export default function PaymentSuccess() {

    const homepage = import.meta.env.VITE_CLIENT_URL;
    const searchQuery = useSearchParams()[0];
    const refNo = searchQuery.get("reference");
    const movieId = searchQuery.get("movieId");
    const host = import.meta.env.VITE_API_URL;

    const addPurchased = async() => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${host}/users/purchase/${movieId}`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              console.log("Movie Purchased Successfully!");
        } catch (err) {
            throw new Error("Failed to purchase movie");
        }
    
    }
    useEffect(() => {
      addPurchased();
    }, [])
    
    return (
        <div className="bg-gray-100 h-screen">
              <div className="bg-white p-6  md:mx-auto">
                <svg viewBox="0 0 24 24" className="text-green-600 w-16 h-16 mx-auto my-6">
                    <path fill="currentColor"
                        d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z">
                    </path>
                </svg>
                <div className="text-center">
                    <h3 className="md:text-2xl text-base text-gray-900 font-semibold text-center">Payment Done!</h3>
                    <p className="text-gray-600 my-2">Thank you for completing your secure online payment.</p>
                    <p className='text-gray-600'> Reference No: {refNo} </p>
                    <div className="py-10 text-center">
                        <a href={homepage} className="px-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3">
                            GO BACK 
                       </a>
                    </div>
                </div>
            </div>
          </div>    
        );
}