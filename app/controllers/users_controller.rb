class UsersController < ApplicationController
    before_action :check_admin, only: %i[ admin process_admin ]
    before_action :get_username, only: %i[ profile get_recording ]
    before_action :get_history, only: %i[ profile get_recording ]

    def login
        @page = 'login'
        @invalid_credentials = flash[:invalid_login]
        render "login_signup"
    end

    def logout
        reset_session
        redirect_to root_path
    end

    def signup
        @page = 'signup'
        @check = flash[:user_data].blank? ? {} : User.new(flash[:user_data])
        @check.valid? unless flash[:user_data].blank?
        render "login_signup"
    end

    def process_signup
        data = user_params
        user = User.new(data);
        if user.save
            session[:user_id] = user.id
            Admin.create(user: user) if User.all.count == 1
            redirect_to root_path
        else
            flash[:user_data] = data
            redirect_to users_signup_path
        end
    end

    def process_login
        data = user_params
        user = User.find_by(username: data[:username]);
        check = (user.blank?) ? false : (user.password != data[:password]) ? false : true
        if check
            session[:user_id] = user.id
            redirect_to root_path
        else
            flash[:invalid_login] = true
            redirect_to users_login_path
        end
    end

    def profile
    end

    def get_recording
        @problem = Problem.find(params[:id])
        @solution = Solution.find_by(user: User.find(session[:user_id]), problem: @problem)
        render "profile"
    end

    def admin
        @self = User.find(session[:user_id])
        @admins = User.joins(:admin).where.not(id: session[:user_id]).order(:username)
        @users = User.where.not(id: @admins.ids).where.not(id: @self.id)
    end

    def process_admin
        if params[:do] == 'remove'
            Admin.find_by(user: User.find(params[:user_id])).destroy
        elsif params[:do] == 'add'
            Admin.create(user: User.find(params[:user_id]))
        end
        redirect_to users_admin_path
    end

    private

    def user_params = params.require(:user).permit(:username, :password, :password_confirmation)

    def get_username 
        unless session[:user_id].blank?
            begin
                user = User.find(session[:user_id])
                @username = user.username
                @admin = (Admin.find_by(user: user).blank?) ? false : true
            rescue
                redirect_to users_logout_path
            end
        end
    end

    def check_admin
        check = (session[:user_id].blank?) ? false : (Admin.find_by(user_id: session[:user_id]).blank?) ? false : true
        if check
            begin
                @username = User.find(session[:user_id]).username
                @admin = true
            rescue
                redirect_to users_logout_path
            end
        else
            redirect_to root_path
        end
    end

    def get_history
        @categories = ['Basic', 'Intermediate', 'Advanced']
        @problems = []

        (0..2).each {|i| @problems.push(Solution.joins(:problem).where("problems.category == #{i}").where(user: User.find(session[:user_id])).select('problems.id, problems.title'))}
    end
end
