class PagesController < ApplicationController
    before_action :check_login, except: %i[ index ]
    before_action :get_problems, only: %i[ lobby solve solution live ]
    before_action :get_problem, only: %i[ solution solve process_solve solution live ]
    before_action :get_record_solutions, only: %i[ solve solution live ]
    @@categories = ['Basic', 'Intermediate', 'Advanced']

    def index
    end

    def lobby
        @categories = @@categories
    end

    def live
        @user_id = params[:user_id]
    end

    def solution
    end

    def solve
        @user_id = session[:user_id]
    end

    def process_solve
        puts "\n\n\ncode: #{params[:recording].length}\n\n\n"
        render json: Page.evaluate_solution(session[:user_id], @problem, params[:code], params[:recording])
    end

    def get_live_data
        render json: Page.get_live_data(params[:room_name])
    end

    private

    def check_login
        unless session[:user_id].blank?
            begin
                @user = User.find(session[:user_id])
                @username = @user.username
                @admin = (Admin.find_by(user_id: session[:user_id]).blank?) ? false : true
            rescue
                redirect_to users_logout_path
            end
        else
            redirect_to pages_index_path
        end
    end

    def get_problems
        problems_basic = Problem.where(category: 0)
        problems_intermediate = Problem.where(category: 1)
        problems_advanced = Problem.where(category: 2)
        @problems = [problems_basic, problems_intermediate, problems_advanced]
        @categories = @@categories
    end

    def get_problem
        id = (params[:problem_id].blank?) ? params[:id] : params[:problem_id]
        @problem = Problem.find(id)
    end

    def get_record_solutions
        user_id = (params[:user_id].blank?) ? session[:user_id] : params[:user_id]
        @watching = User.find(user_id)
        @solution = Solution.find_by(user: @watching, problem: @problem)
        @recording = (@solution.blank?) ? [].to_json.html_safe : @solution.recording.to_json.html_safe
        
        @other_solutions = Page.get_other_solutions(@problem, @watching)
        puts "\n\n\n#{@other_solutions}\n\n\n"
    end
end
