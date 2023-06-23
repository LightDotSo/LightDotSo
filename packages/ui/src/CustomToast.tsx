"use client";

import { NativeToast as Toast } from "./NativeToast";
import Constants, { ExecutionEnvironment } from "expo-constants";

const isExpo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const CustomToast = () => {
  if (isExpo) {
    return null;
  } else {
    return <Toast />;
  }
};
