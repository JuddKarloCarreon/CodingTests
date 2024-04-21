class Page
    # Handles evaluation of submitted code
    def self.evaluate_solution(user_id, problem, code, recording)
        #format: [[[result, 'success/error'], [result, 'success/error'], [result, 'success/error']], X/Y Tests passed]
        errors = []
        results = []
        passed = 0
        total = 0
        ids_passed = [];
        final_time = JSON.parse(recording)
        final_time = final_time[-1][0]
        
        #Check if written function is valid
        begin
            eval("def self.function(#{problem.arg_names}); #{code}; end")
        rescue Exception => exc
            errors.push(exc)
        end

        #If valid, perform tests
        if errors.blank?
            tests = problem.tests
            tests.each do |test|
                exp_result = JSON.parse(JSON.parse(test.result))
                total += 1
                begin
                    result = eval("self.function(#{JSON.parse(test.args)})")
                    type = 'errors'
                    if result == exp_result
                        passed += 1
                        type = 'success'
                        ids_passed.push(test.id)
                    end
                    results.push([result.to_json, type])
                rescue Exception => exc
                    results.push(exc.to_s)
                end
            end
            self.upload_solution(code, ids_passed, recording, final_time, user_id, problem)
            return {results: [results, "#{passed}/#{total} Tests passed"]}
        else
            self.upload_solution(code, ids_passed, recording, final_time, user_id, problem)
            return {errors: errors[0]}
        end
    end

    # Obtains the problem and user data from their ids in the room_name
    def self.get_live_data(room_name)
        room_name = JSON.parse(room_name)
        results = [[], [], []]
        if room_name.is_a?(Array)
            room_name.each do |room|
                result = self.process_live_data(room)
                results[result[:category]].push([result[:output], room]) if result != false
            end
        else
            result = self.process_live_data(room_name)
            results[result[:category]].push([result[:output], room_name]) if result != false
        end

        results.to_json.html_safe
    end

    def self.get_other_solutions(problem, user)
        other_solutions = Solution.joins(:user).where(problem: problem).where.not(user: user).select('solutions.user_id, users.username, solutions.passed_tests, solutions.final_time, solutions.problem_id, solutions.recording').order('length(solutions.passed_tests) DESC, solutions.final_time')
        total_tests = problem.tests.count

        results = []
        other_solutions.each do |record|
            puts "\n\n\n#{record.recording}\n\n\n"
            tests = JSON.parse(record.passed_tests)
            tests = "#{tests.length}/#{total_tests}"
            total_secs = (record.final_time / 1000).truncate()
            mins = (total_secs / 60).truncate()
            secs = (total_secs - (mins * 60)).truncate()
            results.push([record.user_id, record.username, tests, "#{mins}:#{secs}"])
        end

        results
    end

    private

    def self.upload_solution(code, ids_passed, recording, final_time, user_id, problem)
        solution = Solution.find_by(user: User.find(user_id), problem: problem)
        if solution.blank?
            Solution.create(solution: code, passed_tests: ids_passed.to_json.html_safe, recording: recording, final_time: final_time, user: User.find(user_id), problem: problem)
        else
            solution.update(solution: code, passed_tests: ids_passed.to_json.html_safe, recording: recording, final_time: final_time, user: User.find(user_id), problem: problem)
        end
    end

    def self.process_live_data(room_name)
        go_ahead = false
        unless [-1, 0, room_name.length - 1].include?(room_name.index('_')) 
            arr = room_name.split('_')
            arr.map! {|val| val.to_i}
            go_ahead = true if arr.length == 2 && !arr.include?(0)
        end

        if go_ahead
            problem_id, user_id = arr
            problem = Problem.find(problem_id)
            user = User.find(user_id)

            {category: problem.category, output: "#{problem.title} - #{user.username}"}
        else
            false
        end
    end
end