import { Star } from "lucide-react";

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={16}
                    className={`${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                />
            ))}
        </div>
    );
};
export default StarRating;