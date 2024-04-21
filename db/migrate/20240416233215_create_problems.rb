class CreateProblems < ActiveRecord::Migration[7.1]
  def change
    create_table :problems do |t|
      t.string :title
      t.text :description
      t.integer :category

      t.timestamps
    end
  end
end
