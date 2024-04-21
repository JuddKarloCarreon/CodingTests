class Problem < ApplicationRecord
    has_many :solutions, dependent: :destroy
    has_many :tests, dependent: :destroy

    validates :title, presence: true
    validates :description, presence: true, length: {minimum: 8}
    validates :category, presence: true, numericality: {only_integer: true, in: (0..2), message: "Invalid Category."}
    validates :function_name, presence: true
end
