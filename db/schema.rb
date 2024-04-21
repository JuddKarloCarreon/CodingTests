# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_04_17_230246) do
  create_table "admins", force: :cascade do |t|
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_admins_on_user_id"
  end

  create_table "problems", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.integer "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "function_name"
    t.string "arg_names"
  end

  create_table "solutions", force: :cascade do |t|
    t.text "solution"
    t.string "passed_tests"
    t.text "recording"
    t.integer "final_time"
    t.integer "user_id", null: false
    t.integer "problem_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["problem_id"], name: "index_solutions_on_problem_id"
    t.index ["user_id"], name: "index_solutions_on_user_id"
  end

  create_table "tests", force: :cascade do |t|
    t.string "args"
    t.string "result"
    t.integer "problem_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["problem_id"], name: "index_tests_on_problem_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "password"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "admins", "users"
  add_foreign_key "solutions", "problems"
  add_foreign_key "solutions", "users"
  add_foreign_key "tests", "problems"
end
