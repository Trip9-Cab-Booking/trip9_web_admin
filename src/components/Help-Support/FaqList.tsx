import FaqItem from "./FaqItem";
import { FAQ } from "./AdminHelpSupportPage";

type Props = {
    faqs: FAQ[];
    audience: "user" | "driver";
    openTitleId: string | null;
    setOpenTitleId: (id: string | null) => void;
    setFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>;
    editingQaId: string | null;
    setEditingQaId: (id: string | null) => void;
};

export default function FaqList(props: Props) {
    console.log(
        props.faqs.map((f) => f.id)
    );

    return (
        <div className="space-y-4">
            {props.faqs.map((faq) => (
                <FaqItem key={faq.id} faq={faq} {...props} />
            ))}
        </div>
    );
}
