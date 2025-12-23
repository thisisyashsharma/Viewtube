// Routing.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../store/store.js";
import App from "../App";
//EU6u4.p4.a1.1wd -  Subscribed Channels: imported subscribed channels page
import {
  Home,
  YourChannel,
  History,
  Playlist,
  Like,
  CustomizeChannel,
  Signup,
  Login,
  Settings,
  Shorts,
  Video,
  UploadVideo,
  AllVideo,
  AuthLayout,
  Main,
  Subscriptions,
  ReportHistory,
  ReportForm,
  Help,
  Feedback,
  KeyboardShortcut,
  VideoStudio,
  Dashboard,
  About,
  SearchProvider,
  ChannelSearchPage

} from "../components";
import Trending from "../components/Trending.jsx";

function Routing() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Main />} />
            <Route
              path="home"
              element={
                <AuthLayout>
                  <Home />
                </AuthLayout>
              }
            />

            <Route
              path="your_channel/*"
              element={
                <AuthLayout>
                  <YourChannel />
                </AuthLayout>
              }
            >

              <Route
                index
                element={
                  <AuthLayout>
                    <AllVideo />
                  </AuthLayout>
                }
              />
              <Route
                path="upload_video"
                element={
                  <AuthLayout>
                    <UploadVideo />
                  </AuthLayout>
                }
              />
              <Route
                path="about"
                element={
                  <AuthLayout>
                    <About />
                  </AuthLayout>
                }
              />
            </Route>

            <Route
              path="history"
              element={
                <AuthLayout>
                  <History />
                </AuthLayout>
              }
            />
            <Route
              path="playlist"
              element={
                <AuthLayout>
                  <Playlist />
                </AuthLayout>
              }
            />
            <Route
              path="like"
              element={
                <AuthLayout>
                  <Like />
                </AuthLayout>
              }
            />

            <Route
              path="shorts"
              element={
                <AuthLayout>
                  <Shorts />
                </AuthLayout>
              }
            />
            <Route
              path="watch/:id"
              element={
                <AuthLayout>
                  <Video />
                </AuthLayout>
              }
            />
            <Route
              path="customize_channel"
              element={
                <AuthLayout>
                  <CustomizeChannel />
                </AuthLayout>
              }
            />
            <Route
              path="settings"
              element={
                <AuthLayout>
                  <Settings />
                </AuthLayout>
              }
            />
            <Route
              path="reportHistory"
              element={
                <AuthLayout>
                  <ReportHistory />
                </AuthLayout>
              }
            />
            <Route
              path="help"
              element={
                <AuthLayout>
                  <Help />
                </AuthLayout>
              }
            />
            <Route
              path="feedback"
              element={
                <AuthLayout>
                  <Feedback />
                </AuthLayout>
              }
            />
            {/* EU6u4.p4.a2.5ln -  Subscribed Channels: routed the subscription page */}
            <Route
              path="subscriptions"
              element={
                <AuthLayout>
                  <Subscriptions />
                </AuthLayout>
              }
            />
            <Route
              path="keyboardShortcut"
              element={
                <AuthLayout>
                  <KeyboardShortcut />
                </AuthLayout>
              }
            />
            <Route
              path="/reportForm/:id"
              element={
                <AuthLayout>
                  <ReportForm />
                </AuthLayout>
              }
            />
            <Route
              path="videoStudio"
              element={
                <AuthLayout>
                  <VideoStudio />
                </AuthLayout>
              }
            />
            <Route
              path="dashboard"
              element={
                <AuthLayout>
                  <Dashboard />
                </AuthLayout>
              }
            />
            <Route
              path="trending"
              element={
                <AuthLayout>
                  <Trending />
                </AuthLayout>
              }
            />
          </Route>
          <Route
            path="search"
            element={
              <AuthLayout>
                <SearchProvider />
              </AuthLayout>
            }
          />

          <Route path="/channels/search" element={<ChannelSearchPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default Routing;
