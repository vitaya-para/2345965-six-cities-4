import { useState, ChangeEvent, useEffect, Fragment } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { LoadingStatus, StarRate } from '../const';
import {
  getIsReviewsStatusSubmitting,
  getReviewsHasError,
  postReviewAction,
  setReviewsErrorStatus,
} from '../store';

const MIN_REVIEW_LENGTH = 50;
const MAX_REVIEW_LENGTH = 300;
const INITIAL_RATING = 0;

type Review = {
  text: string;
  rating: number;
};

type CommentFromProps = {
  id: string;
};

function CommentForm({ id }: CommentFromProps): JSX.Element {
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(getIsReviewsStatusSubmitting);
  const reviewsStatus = useAppSelector(getReviewsHasError);

  const [review, setReview] = useState<Review>({
    text: '',
    rating: INITIAL_RATING,
  });

  const [valid, setValid] = useState(false);
  const disabledSubmitButton = !valid || isLoading;

  const validateForm = (comment: string, newRating: number) => {
    const isValid = comment.length >= MIN_REVIEW_LENGTH
      && comment.length <= MAX_REVIEW_LENGTH
      && newRating !== INITIAL_RATING;
    setValid(isValid);
  };

  const resetForm = () => {
    setValid(false);
    setReview({
      text: '',
      rating: INITIAL_RATING,
    });
  };

  useEffect(() => {
    if (reviewsStatus === LoadingStatus.Success) {
      resetForm();
      dispatch(setReviewsErrorStatus(LoadingStatus.Idle));
    } else {
      dispatch(setReviewsErrorStatus(LoadingStatus.Error));
    }
  }, [reviewsStatus, dispatch]);

  const handleRatingChange = (evt: any) => {
    console.log(1);
    const newRating = Number(evt.target.value);
    setReview((prevReview) => ({ ...prevReview, rating: newRating }));
    validateForm(review.text, newRating);
  };

  const handleTextChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = evt.target.value;
    setReview((prevReview) => ({ ...prevReview, text: newText }));
    validateForm(newText, review.rating);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      postReviewAction({
        offerId: id,
        comment: review.text,
        rating: review.rating,
      })
    );
  };

  return (
    <form className="reviews__form form" action="#" method="post" onSubmit={handleSubmit}>
      <label className="reviews__label form__label" htmlFor="review">Your review</label>
      <div className="reviews__rating-form form__rating">
        {Object.entries(StarRate).map(([title, ratingStar]) => (
          <Fragment key={ratingStar}>
            <input
              className="form__rating-input visually-hidden"
              name="rating"
              value={ratingStar}
              id={`${ratingStar}-stars`}
              type="radio"
              disabled={disabledSubmitButton}
              onChange={handleRatingChange}
              checked={review.rating === Number(ratingStar)}
            />
            <label htmlFor={`${ratingStar}-stars`} className="reviews__rating-label form__rating-label" title={title}>
              <svg className="form__star-image" width="37" height="33">
                <use xlinkHref="#icon-star"></use>
              </svg>
            </label>
          </Fragment>
        ))}
      </div>
      <textarea
        className="reviews__textarea form__textarea"
        id="review"
        name="review"
        placeholder="Tell how was your stay, what you like and what can be improved"
        value={review.text}
        onChange={handleTextChange}
        disabled={isLoading}
        required
      >
      </textarea>
      <div className="reviews__button-wrapper">
        <p className="reviews__help">
          To submit review please make sure to set <span className="reviews__star">rating</span> and describe your stay with at least <b className="reviews__text-amount">{MIN_REVIEW_LENGTH} characters</b>.
        </p>
        <button className="reviews__submit form__submit button" type="submit" disabled={disabledSubmitButton}>Submit</button>
      </div>
    </form>
  );
}

export default CommentForm;
