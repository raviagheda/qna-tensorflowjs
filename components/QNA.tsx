import { Container, Input, Link, Loading, Modal, Textarea } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Button, Text } from "@nextui-org/react";
import * as QNAModel from '@tensorflow-models/qna';
import _ from "underscore";
import JSONPretty from 'react-json-pretty';
import { IAnswer } from "../interfaces/answer.interface";


export default function QNA () {
    const [paragraph, setParagraph] = useState('Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, search engine, cloud computing, software, and hardware. It is considered one of the Big Four technology companies, alongside Amazon, Apple, and Facebook. Google was founded in September 1998 by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University in California. Together they own about 14 percent of its shares and control 56 percent of the stockholder voting power through supervoting stock. They incorporated Google as a California privately held company on September 4, 1998, in California. Google was then reincorporated in Delaware on October 22, 2002. An initial public offering (IPO) took place on August 19, 2004, and Google moved to its headquarters in Mountain View, California, nicknamed the Googleplex. In August 2015, Google announced plans to reorganize its various interests as a conglomerate called Alphabet Inc. Google is Alphabet\'s leading subsidiary and will continue to be the umbrella company for Alphabets Internet interests. Sundar Pichai was appointed CEO of Google, replacing Larry Page who became the CEO of Alphabet.');
    const [question, setQuestion] = useState('Who is the CEO of Google?');
    const [predictedAnswer, setPredictedAnswer] = useState<Array<IAnswer>>([]);
    const [accurateAnswer, setAccurateAnswer] = useState<IAnswer>();
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState<boolean>(false);

    useEffect(() => {
        predictAnswer();
    }, [])

    const predictAnswer = async () => {
        if (!paragraph || !question || isLoading) return;
        setIsLoading(true);
        try {
            const model = await QNAModel.load();
            const answers: any = await model.findAnswers(question, paragraph);
            if (answers) {
                console.log("answers", answers);
                setPredictedAnswer(answers);
                setAccurateAnswer(_.max(answers, (item) => item.score));
            }
            console.log("answers => ", answers);
            setIsLoading(false);
        } catch (err: any) {
            alert(err?.message)
            console.log("ERROR => ", err);
            setIsLoading(false);
        }
    }

    return <>

        <Container>
            <div className="grid grid-cols-1 md:divide-x md:grid-cols-2">
                <Container>
                    <Text size={32}>Question</Text>
                    <div className="mt-2">
                        <Textarea placeholder="Enter Paragraph" fullWidth={true} rows={12} cols={100} value={paragraph} onChange={(e: any) => setParagraph(e?.target?.value)} />
                    </div>
                    <div className="my-4">
                        <Input label="Ask any question" placeholder="Enter Question" fullWidth={true} type="text" value={question} onChange={(e: any) => setQuestion(e?.target?.value)}></Input>
                    </div>
                    <div>
                        <Button disabled={isLoading || !paragraph || !question} onClick={predictAnswer}>
                            {isLoading && <Loading type="points-opacity" color="currentColor" size="sm" />}
                            {!isLoading && 'Predict'}
                        </Button>
                    </div>
                </Container>
                <Container>
                    <Text size={32}>Answer</Text>
                    <div className="mt-2">
                        {accurateAnswer && !isLoading && <div>
                            <div className="p-4 text-sm text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-300" role="alert">
                                <Text size={18}>{accurateAnswer?.text}</Text>
                            </div>
                            <Text className="mt-2">Score: {accurateAnswer?.score}</Text>
                            <Text className="mt-2">Start Index: {accurateAnswer?.startIndex}</Text>
                            <Text className="mt-2">End Index: {accurateAnswer?.endIndex}</Text>
                        </div>}

                        {predictedAnswer?.length > 1 && !isLoading && <div className="mt-3">
                            <Link color="primary" className="cursor-pointer" underline onClick={() => { setShowModal(true) }}>
                                View all predicted answers
                            </Link>
                        </div>}

                        {isLoading && <div role="status" className="max-w-sm animate-pulse">
                            <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                            <div className="h-3.5 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                            <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                            <div className="h-3.5 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                            <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                            <div className="h-3.5 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                            <span className="sr-only">Loading...</span>
                        </div>}
                    </div>

                </Container>
            </div>
        </Container>
        {/* Modal */}
        <Modal
            closeButton
            aria-labelledby="modal-title"
            open={showModal}
            scroll
            width="800px"
            onClose={() => { setShowModal(false) }}
        >
            <Modal.Header>
                <Text id="modal-title" size={18}>
                    {predictedAnswer?.length} Predicted Answers
                </Text>
            </Modal.Header>
            <Modal.Body autoMargin>
                <div className="bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-30 p-3 overflow-auto">
                <JSONPretty id="json-pretty" data={predictedAnswer}></JSONPretty>
                </div>
            </Modal.Body>
            <Modal.Footer>

                <Button auto flat onPress={() => {setShowModal(false)}}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}

