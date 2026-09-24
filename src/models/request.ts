export enum RequestStateEnum {
  Loading = "loading",
  Success = "success",
  Error = "error",
  Undefined = "undefined",
}

export type LoadingState = {
  state: RequestStateEnum.Loading;
};

export type SuccessState<T> = {
  state: RequestStateEnum.Success;
  data: T;
};

export type ErrorState = {
  state: RequestStateEnum.Error;
  error: string;
};

export type UndefinedState = {
  state: RequestStateEnum.Undefined;
};

export type RequestState<T> =
  | LoadingState
  | SuccessState<T>
  | ErrorState
  | UndefinedState;
