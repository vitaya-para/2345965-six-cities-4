import { AxiosInstance } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, State } from '../types/state.js';
import { Offer } from '../types/offer.js';
import { addReview, loadOfferPageData, loadOffers, setAuthorizationStatus, setError, setLoadingStatus } from './action';
import { APIRoute, AuthorizationStatus, TIMEOUT_SHOW_ERROR } from '../const';
import { store } from './';
import { dropToken, saveToken } from '../services/token.js';
import { AuthData } from '../types/auth-data.js';
import { UserData } from '../types/user-data.js';
import { DetailedOffer } from '../types/detailed-offer.js';
import { Review } from '../types/review.js';
import { CommentFormData } from '../types/comment-form-data.js';

export const clearErrorAction = createAsyncThunk(
  'clearError',
  () => {
    setTimeout(
      () => store.dispatch(setError(null)),
      TIMEOUT_SHOW_ERROR
    );
  }
);

export const fetchOffersAction = createAsyncThunk<void, undefined,
  {
    dispatch: AppDispatch;
    state: State;
    extra: AxiosInstance;
  }
>('fetchOffers',
  async (_arg, { dispatch, extra: api }) => {
    dispatch(setLoadingStatus(true));
    const { data } = await api.get<Offer[]>(APIRoute.Offers);
    dispatch(loadOffers(data));
    dispatch(setLoadingStatus(false));
  }
);

export const fetchOfferPageDataAction = createAsyncThunk<void, { id: string },
  {
    dispatch: AppDispatch;
    state: State;
    extra: AxiosInstance;
  }
>('fetchOfferPageData', async ({ id }, { dispatch, extra: api }) => {
  const { data: detailedOffer } = await api.get<DetailedOffer>(`${APIRoute.Offers}/${id}`);
  const { data: nearestOffers } = await api.get<Offer[]>(`${APIRoute.Offers}/${id}/nearby`);
  const { data: reviews } = await api.get<Review[]>(`${APIRoute.Comments}/${id}`);
  dispatch(loadOfferPageData({ detailedOffer, nearestOffers, reviews }));
});

export const checkAuthAction = createAsyncThunk<void, undefined, {
  dispatch: AppDispatch;
  state: State;
  extra: AxiosInstance;
  }
>(
  'checkAuth',
  async (_arg, {dispatch, extra: api}) => {
    try {
      await api.get(APIRoute.Login);
      dispatch(setAuthorizationStatus(AuthorizationStatus.Auth));
    } catch {
      dispatch(setAuthorizationStatus(AuthorizationStatus.NoAuth));
    }
  },
);

export const loginAction = createAsyncThunk<void, AuthData, {
  dispatch: AppDispatch;
  state: State;
  extra: AxiosInstance;
  }
>(
  'login',
  async ({login: email, password}, {dispatch, extra: api}) => {
    const {data: {token}} = await api.post<UserData>(APIRoute.Login, {email, password});
    saveToken(token);
    dispatch(setAuthorizationStatus(AuthorizationStatus.Auth));
  },
);

export const logoutAction = createAsyncThunk<void, undefined, {
  dispatch: AppDispatch;
  state: State;
  extra: AxiosInstance;
  }
>(
  'logout',
  async (_arg, {dispatch, extra: api}) => {
    await api.delete(APIRoute.Logout);
    dropToken();
    dispatch(setAuthorizationStatus(AuthorizationStatus.NoAuth));
  },
);

export const sendCommentAction = createAsyncThunk<void,
  {
    postId: string;
    rewiew: CommentFormData;
  },
  {
    dispatch: AppDispatch;
    state: State;
    extra: AxiosInstance;
  }
>('sendComment', async ({ postId, rewiew }, { dispatch, extra: api }) => {
  const { data: review } = await api.post<Review>(
    `${APIRoute.Comments}/${postId}`,
    {
      comment: rewiew.comment,
      rating: rewiew.rating,
    }
  );
  dispatch(addReview(review));
});