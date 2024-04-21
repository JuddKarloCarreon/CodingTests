class CreateTests < ActiveRecord::Migration[7.1]
  def change
    create_table :tests do |t|
      t.string :args
      t.string :result
      t.references :problem, null: false, foreign_key: true

      t.timestamps
    end
  end
end
