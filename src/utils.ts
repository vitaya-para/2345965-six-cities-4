import { SORT_TYPES } from './const';
import { Offer } from './types/offer';

export const sortOffers = (
  offers: Offer[],
  sortType: string
): Offer[] => {
  const sortedOffers = [...offers];
  switch (sortType) {
    case SORT_TYPES.Popular: {
      return sortedOffers;
    }
    case SORT_TYPES.LowToHigh:
      return sortedOffers.sort((offerA, offerB) => offerA.price - offerB.price);
    case SORT_TYPES.HighToLow:
      return sortedOffers.sort((offerA, offerB) => offerB.price - offerA.price);
    case SORT_TYPES.TopRatedFirst:
      return sortedOffers.sort((offerA, offerB) => offerB.rating - offerA.rating);
    default:
      throw new Error('Unknown sort type');
  }
};

export const formatRating = (rate: number) => `${(rate / 5) * 100}%`;

export const isPasswordValid = (password: string): boolean => {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasLetter && hasNumber;
};

export function getRandomArrayElement<T>(array: T[]) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
