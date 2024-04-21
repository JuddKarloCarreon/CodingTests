class AddFunctionNameArgsToProblems < ActiveRecord::Migration[7.1]
  def change
    add_column :problems, :function_name, :string
    add_column :problems, :arg_names, :string
  end
end
