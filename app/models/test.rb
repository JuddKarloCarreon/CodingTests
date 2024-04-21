class Test < ApplicationRecord
    belongs_to :problem

    validates :args, presence: true
    validates :result, presence: true
    validates :problem, presence: true

    def self.validate_args_result(test_data, id = nil)
        tests = []
        errors = []
        unless id.blank? 
            all_tests = Problem.find(id).tests
            count = all_tests.to_a.length
        end
        for i in 0...test_data["args"].length do
            if id.blank?
                test = self.new(args: test_data["args"][i].to_json, result: test_data["result"][i].to_json)
            else
                if i < count
                    test = all_tests[i]
                    test.assign_attributes(args: test_data["args"][i].to_json, result: test_data["result"][i].to_json)
                else
                    test = self.new(args: test_data["args"][i].to_json, result: test_data["result"][i].to_json, problem_id: id)
                end
            end
            check = true
            [:args, :result].each do |param|
                result = test.valid_attribute?(param)
                if result != true
                    result = result.map {|err| "Test #{i + 1}: " + err}
                    errors.push(result)
                    check = false
                end
            end
            tests.push(test) if check
        end
        [tests, errors]
    end

    def self.delete_excess(test_data, id)
        all_tests = Problem.find(id).tests
        count = all_tests.to_a.length
        for i in (test_data["args"].length...count) do
            all_tests[i].destroy
        end
    end

    def valid_attribute?(attribute_name)
        self.valid?
        result = (self.errors[attribute_name].blank?) ? true : self.errors.full_messages_for(attribute_name)
    end
end
