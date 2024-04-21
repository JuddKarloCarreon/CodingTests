class Solution < ApplicationRecord
    belongs_to :user
    belongs_to :problem

    validates :recording, presence: true
    validates :user, presence: true
    validates :problem, presence: true
end
