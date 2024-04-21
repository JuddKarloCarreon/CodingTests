class CreateSolutions < ActiveRecord::Migration[7.1]
  def change
    create_table :solutions do |t|
      t.text :solution
      t.string :passed_tests
      t.text :recording
      t.integer :final_time
      t.references :user, null: false, foreign_key: true
      t.references :problem, null: false, foreign_key: true

      t.timestamps
    end
  end
end
