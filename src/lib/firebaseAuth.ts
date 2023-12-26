import type { FirebaseOptions } from "firebase/app";
import { initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { parse } from "querystring";

let fbClientConfig: FirebaseOptions = {};

export function initFirebase(fbClientConfigStr: string) {
  try {
    fbClientConfig = fbClientConfigStr ? parse(fbClientConfigStr) : {};
  } catch (error) {
    console.log("FAILED_TO_PARSE_FB_CLIENT_CFG", { error });
  }

  let app;
  try {
    app = getApp();
  } catch (error) {
    app = initializeApp(fbClientConfig);
  }

  // Initialize Firebase Authentication and get a reference to the service
  const auth = app ? getAuth(app) : undefined;

  return { app, auth };
}
