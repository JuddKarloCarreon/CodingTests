class User < ApplicationRecord
    has_one :admin, dependent: :destroy
    has_many :solutions, dependent: :destroy

    validates :username, presence: true, uniqueness: true
    validates :password, presence: true, length: {minimum: 8}, confirmation: true

    encrypts :password
end
