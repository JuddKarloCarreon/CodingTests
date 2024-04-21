Rails.application.routes.draw do
  get 'pages/:id/solution', to: 'pages#solution'
  get 'pages/:id/solve', to: 'pages#solve'
  get 'pages/:problem_id/solution/:user_id', to: 'pages#solution'
  get 'pages/:problem_id/live/:user_id', to: 'pages#live'
  get 'pages/get_live_data/:room_name', to: 'pages#get_live_data'
  get 'pages/index'
  get 'users/login'
  get 'users/logout'
  get 'users/signup'
  get 'users/profile'
  get 'users/profile/:id', to: 'users#get_recording'
  get 'users/admin'
  post 'users/login', to: 'users#process_login'
  post 'users/signup', to: 'users#process_signup'
  post 'users/admin', to: 'users#process_admin'
  post 'pages/:id/solve', to: 'pages#process_solve'
  resources :problems
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  root "pages#lobby"
end
