class ProblemsController < ApplicationController
    before_action :check_admin
    before_action :set_problem, only: %i[ show edit update destroy ]
    @@categories = ['Basic', 'Intermediate', 'Advanced']

    # GET /problems or /problems.json
    def index
        # @problems = Problem.all.order(:category)
        problems_basic = Problem.where(category: 0)
        problems_intermediate = Problem.where(category: 1)
        problems_advanced = Problem.where(category: 2)
        @problems = [problems_basic, problems_intermediate, problems_advanced]
        @categories = @@categories
    end

    # GET /problems/1 or /problems/1.json
    def show
    end

    # GET /problems/new
    def new
        @problem = Problem.new
    end

    # GET /problems/1/edit
    def edit
        @tests = Test.where(problem: @problem)
    end

    # POST /problems or /problems.json
    def create
        @problem = Problem.new(problem_params)
        @tests, errors = Test.validate_args_result(test_params)

        puts "\n\n\n#{errors.to_s}\n\n\n";

        respond_to do |format|
            if @problem.valid? && errors.blank?
                @problem.save
                @tests.each do |test|
                    test.problem = @problem
                    test.save
                end
                format.html { redirect_to problem_url(@problem), notice: "Problem was successfully created." }
                format.json { render :show, status: :created, location: @problem }
            else
                @test_errors = errors
                format.html { render :new, status: :unprocessable_entity }
                format.json { render json: @problem.errors, status: :unprocessable_entity }
            end
        end
    end

    # PATCH/PUT /problems/1 or /problems/1.json
    def update
        @problem.assign_attributes(problem_params)
        @tests, errors = Test.validate_args_result(test_params, params[:id])
        @tests.each {|test| puts "\n\n\n#{test.args}::#{test.result}\n\n\n"}
        
        respond_to do |format|
            if @problem.valid? && errors.blank?
                @problem.save
                @tests.each do |test|
                    test.problem = @problem
                    test.save
                end
                Test.delete_excess(test_params, params[:id])
                format.html { redirect_to problem_url(@problem), notice: "Problem was successfully updated." }
                format.json { render :show, status: :ok, location: @problem }
            else
                @test_errors = errors
                format.html { render :edit, status: :unprocessable_entity }
                format.json { render json: @problem.errors, status: :unprocessable_entity }
            end
        end
    end

    # DELETE /problems/1 or /problems/1.json
    def destroy
        @problem.destroy!

        respond_to do |format|
        format.html { redirect_to problems_url, notice: "Problem was successfully destroyed." }
        format.json { head :no_content }
        end
    end

    private

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

    # Use callbacks to share common setup or constraints between actions.
    def set_problem
        @problem = Problem.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def problem_params
        params.require(:problem).permit(:title, :description, :category, :function_name, :arg_names)
    end
    def test_params
        params[:test]
    end
end
